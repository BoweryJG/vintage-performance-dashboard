class AdvancedInteractions {
    constructor(dashboard) {
        this.dashboard = dashboard;
        this.isDragging = false;
        this.dragGauge = null;
        this.lastMousePosition = new THREE.Vector2();
        this.touchStartPosition = new THREE.Vector2();
        this.gestureStartScale = 1;
        this.gestureStartRotation = 0;
        
        this.setupAdvancedControls();
        this.setupHapticFeedback();
        this.setupVoiceControls();
    }
    
    setupAdvancedControls() {
        const canvas = document.getElementById('canvas');
        
        // Enhanced mouse controls
        canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
        canvas.addEventListener('mousemove', (event) => this.onMouseMove(event));
        canvas.addEventListener('mouseup', (event) => this.onMouseUp(event));
        canvas.addEventListener('wheel', (event) => this.onWheel(event));
        
        // Touch controls for mobile
        canvas.addEventListener('touchstart', (event) => this.onTouchStart(event));
        canvas.addEventListener('touchmove', (event) => this.onTouchMove(event));
        canvas.addEventListener('touchend', (event) => this.onTouchEnd(event));
        canvas.addEventListener('gesturestart', (event) => this.onGestureStart(event));
        canvas.addEventListener('gesturechange', (event) => this.onGestureChange(event));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (event) => this.onKeyDown(event));
        
        // Device orientation for mobile tilt
        if (window.DeviceOrientationEvent) {
            window.addEventListener('deviceorientation', (event) => this.onDeviceOrientation(event));
        }
    }
    
    onMouseDown(event) {
        this.lastMousePosition.set(event.clientX, event.clientY);
        
        const mouse = new THREE.Vector2();
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.dashboard.camera);
        
        // Check if clicking on a gauge needle
        const needles = this.dashboard.gauges.map(g => g.needle);
        const intersects = raycaster.intersectObjects(needles);
        
        if (intersects.length > 0) {
            this.isDragging = true;
            this.dragGauge = this.dashboard.gauges.find(g => g.needle === intersects[0].object);
            this.triggerHapticFeedback('light');
            
            // Visual feedback
            this.dragGauge.needle.material.emissiveIntensity = 0.5;
            document.body.style.cursor = 'grabbing';
        }
    }
    
    onMouseMove(event) {
        if (this.isDragging && this.dragGauge) {
            const deltaX = event.clientX - this.lastMousePosition.x;
            const sensitivity = 0.01;
            
            // Calculate new needle angle based on mouse movement
            const currentAngle = this.dragGauge.needle.rotation.z;
            const newAngle = currentAngle + deltaX * sensitivity;
            
            // Clamp angle to gauge range
            const minAngle = -Math.PI * 0.75;
            const maxAngle = Math.PI * 0.75;
            const clampedAngle = Math.max(minAngle, Math.min(maxAngle, newAngle));
            
            this.dragGauge.needle.rotation.z = clampedAngle;
            
            // Update the gauge value
            const normalizedValue = (clampedAngle - minAngle) / (maxAngle - minAngle);
            const newValue = normalizedValue * this.dragGauge.config.max;
            this.dragGauge.currentValue = newValue;
            
            // Provide continuous haptic feedback during drag
            if (Math.abs(deltaX) > 5) {
                this.triggerHapticFeedback('light');
            }
        }
        
        this.lastMousePosition.set(event.clientX, event.clientY);
    }
    
    onMouseUp(event) {
        if (this.isDragging && this.dragGauge) {
            // Reset visual feedback
            this.dragGauge.needle.material.emissiveIntensity = 0.2;
            this.triggerHapticFeedback('medium');
            
            // Snap to nearest increment for precision
            this.snapToIncrement(this.dragGauge);
            
            document.body.style.cursor = 'default';
        }
        
        this.isDragging = false;
        this.dragGauge = null;
    }
    
    onWheel(event) {
        event.preventDefault();
        
        // Zoom functionality
        const zoomSpeed = 0.1;
        const camera = this.dashboard.camera;
        
        if (event.deltaY > 0) {
            camera.position.multiplyScalar(1 + zoomSpeed);
        } else {
            camera.position.multiplyScalar(1 - zoomSpeed);
        }
        
        // Clamp zoom levels
        const distance = camera.position.length();
        if (distance < 5) camera.position.normalize().multiplyScalar(5);
        if (distance > 20) camera.position.normalize().multiplyScalar(20);
    }
    
    onTouchStart(event) {
        event.preventDefault();
        
        if (event.touches.length === 1) {
            this.touchStartPosition.set(event.touches[0].clientX, event.touches[0].clientY);
            
            // Convert to mouse event for gauge interaction
            const mouseEvent = {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
            this.onMouseDown(mouseEvent);
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1 && this.isDragging) {
            const mouseEvent = {
                clientX: event.touches[0].clientX,
                clientY: event.touches[0].clientY
            };
            this.onMouseMove(mouseEvent);
        } else if (event.touches.length === 2) {
            // Two-finger gesture for dashboard rotation
            this.handleTwoFingerGesture(event);
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.onMouseUp(event);
    }
    
    onGestureStart(event) {
        event.preventDefault();
        this.gestureStartScale = this.dashboard.dashboardGroup.scale.x;
        this.gestureStartRotation = this.dashboard.dashboardGroup.rotation.y;
    }
    
    onGestureChange(event) {
        event.preventDefault();
        
        // Scale dashboard with pinch gesture
        const newScale = this.gestureStartScale * event.scale;
        const clampedScale = Math.max(0.5, Math.min(2.0, newScale));
        
        this.dashboard.dashboardGroup.scale.setScalar(clampedScale);
        
        // Rotate dashboard with rotation gesture
        const newRotation = this.gestureStartRotation + event.rotation * Math.PI / 180;
        this.dashboard.dashboardGroup.rotation.y = newRotation;
    }
    
    handleTwoFingerGesture(event) {
        const touch1 = event.touches[0];
        const touch2 = event.touches[1];
        
        // Calculate gesture center
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        
        // Rotate dashboard around center
        const deltaX = centerX - window.innerWidth / 2;
        const rotationY = deltaX * 0.01;
        
        this.dashboard.dashboardGroup.rotation.y = rotationY;
    }
    
    onKeyDown(event) {
        switch(event.code) {
            case 'Space':
                event.preventDefault();
                this.cycleEnvironment();
                break;
            case 'KeyR':
                this.resetDashboard();
                break;
            case 'KeyF':
                this.toggleFullscreen();
                break;
            case 'KeyV':
                this.toggleVoiceMode();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
                const gaugeIndex = parseInt(event.code.slice(-1)) - 1;
                if (gaugeIndex < this.dashboard.gauges.length) {
                    this.focusOnGauge(gaugeIndex);
                }
                break;
        }
    }
    
    onDeviceOrientation(event) {
        // Use device tilt to adjust camera angle on mobile
        if (event.gamma !== null && event.beta !== null) {
            const gamma = event.gamma * Math.PI / 180; // left-right tilt
            const beta = event.beta * Math.PI / 180;   // front-back tilt
            
            // Apply subtle camera adjustments
            this.dashboard.camera.rotation.z = gamma * 0.1;
            this.dashboard.camera.rotation.x = (beta - Math.PI/2) * 0.1;
        }
    }
    
    snapToIncrement(gauge) {
        const increment = gauge.config.max / 10; // 10 major divisions
        const snappedValue = Math.round(gauge.currentValue / increment) * increment;
        
        // Animate to snapped position
        const targetAngle = this.dashboard.valueToAngle(snappedValue, gauge.config.max);
        this.animateNeedleToAngle(gauge, targetAngle);
        
        gauge.currentValue = snappedValue;
    }
    
    animateNeedleToAngle(gauge, targetAngle) {
        const startAngle = gauge.needle.rotation.z;
        const duration = 300;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Elastic easing for satisfying feel
            const easeProgress = progress < 0.5 
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            gauge.needle.rotation.z = startAngle + (targetAngle - startAngle) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.triggerHapticFeedback('medium');
            }
        };
        
        animate();
    }
    
    cycleEnvironment() {
        const environments = ['space', 'ocean', 'desert', 'forest', 'tundra'];
        const currentIndex = environments.indexOf(this.dashboard.currentEnvironmentName || 'space');
        const nextIndex = (currentIndex + 1) % environments.length;
        
        this.dashboard.environmentManager.switchEnvironment(environments[nextIndex]);
        this.dashboard.currentEnvironmentName = environments[nextIndex];
        
        this.triggerHapticFeedback('heavy');
        this.showEnvironmentTransition(environments[nextIndex]);
    }
    
    resetDashboard() {
        // Reset all gauges to their original values
        this.dashboard.gauges.forEach(gauge => {
            const targetAngle = this.dashboard.valueToAngle(gauge.config.value, gauge.config.max);
            this.animateNeedleToAngle(gauge, targetAngle);
            gauge.currentValue = gauge.config.value;
        });
        
        // Reset camera position
        this.dashboard.camera.position.set(0, 2, 8);
        this.dashboard.camera.lookAt(0, 0, 0);
        
        // Reset dashboard transform
        this.dashboard.dashboardGroup.scale.setScalar(1);
        this.dashboard.dashboardGroup.rotation.set(0, 0, 0);
        
        this.triggerHapticFeedback('heavy');
    }
    
    focusOnGauge(index) {
        const gauge = this.dashboard.gauges[index];
        if (!gauge) return;
        
        // Animate camera to focus on specific gauge
        const targetPosition = new THREE.Vector3(
            gauge.config.position.x,
            gauge.config.position.y + 1,
            gauge.config.position.z + 3
        );
        
        this.animateCameraTo(targetPosition);
        
        // Highlight the gauge
        this.highlightGauge(gauge);
    }
    
    animateCameraTo(targetPosition) {
        const startPosition = this.dashboard.camera.position.clone();
        const duration = 1500;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            this.dashboard.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);
            this.dashboard.camera.lookAt(0, 0, 0);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    highlightGauge(gauge) {
        // Temporarily increase emissive intensity
        const originalIntensity = gauge.needle.material.emissiveIntensity;
        gauge.needle.material.emissiveIntensity = 1.0;
        
        setTimeout(() => {
            gauge.needle.material.emissiveIntensity = originalIntensity;
        }, 1000);
    }
    
    setupHapticFeedback() {
        // Check if device supports haptic feedback
        this.hasHapticFeedback = 'vibrate' in navigator;
    }
    
    triggerHapticFeedback(intensity = 'medium') {
        if (!this.hasHapticFeedback) return;
        
        const patterns = {
            light: [10],
            medium: [50],
            heavy: [100, 50, 100]
        };
        
        navigator.vibrate(patterns[intensity] || patterns.medium);
    }
    
    setupVoiceControls() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';
            
            this.recognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase();
                this.processVoiceCommand(command);
            };
            
            this.recognition.onerror = (event) => {
                console.log('Speech recognition error:', event.error);
            };
        }
    }
    
    toggleVoiceMode() {
        if (this.recognition) {
            if (this.voiceMode) {
                this.recognition.stop();
                this.voiceMode = false;
                this.showNotification('Voice mode disabled');
            } else {
                this.recognition.start();
                this.voiceMode = true;
                this.showNotification('Voice mode enabled - Try "show revenue" or "switch environment"');
            }
        }
    }
    
    processVoiceCommand(command) {
        if (command.includes('show revenue')) {
            this.focusOnGauge(1);
        } else if (command.includes('show performance')) {
            this.focusOnGauge(0);
        } else if (command.includes('switch environment') || command.includes('change background')) {
            this.cycleEnvironment();
        } else if (command.includes('reset')) {
            this.resetDashboard();
        } else if (command.includes('zoom in')) {
            this.dashboard.camera.position.multiplyScalar(0.8);
        } else if (command.includes('zoom out')) {
            this.dashboard.camera.position.multiplyScalar(1.2);
        }
        
        // Restart listening if in voice mode
        if (this.voiceMode) {
            setTimeout(() => {
                this.recognition.start();
            }, 1000);
        }
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    showEnvironmentTransition(environmentName) {
        const notification = document.createElement('div');
        notification.innerHTML = `Environment: ${environmentName.toUpperCase()}`;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(11, 77, 59, 0.9);
            color: #F5F5DC;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 18px;
            font-weight: bold;
            letter-spacing: 2px;
            z-index: 1000;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2000);
    }
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.innerHTML = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(183, 137, 95, 0.9);
            color: #F5F5DC;
            padding: 15px 25px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 3000);
    }
}