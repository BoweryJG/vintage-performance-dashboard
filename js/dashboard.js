class LuxuryDashboard {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.dashboardGroup = new THREE.Group();
        this.gauges = [];
        this.environmentManager = null;
        this.advancedInteractions = null;
        this.currentEnvironmentName = 'space';
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.selectedGauge = null;
        
        // Color palette
        this.colors = {
            racingGreen: 0x0B4D3B,
            cognacLeather: 0xB7895F,
            cream: 0xF5F5DC,
            charcoal: 0x2F2F2F,
            silver: 0xC0C0C0,
            roseGold: 0xE8B4A0,
            amber: 0xFFBF00,
            redZone: 0x8B0000
        };
        
        // Sales data simulation
        this.salesData = {
            quarterProgress: 87,
            revenue: 245000,
            quota: 300000,
            deals: 23,
            pipeline: 580000,
            commission: 36750,
            ranking: 3,
            velocity: 12
        };
        
        this.init();
    }
    
    init() {
        console.log('Initializing luxury dashboard...');
        this.setupScene();
        console.log('Scene created, background:', this.scene.background);
        this.setupCamera();
        console.log('Camera position:', this.camera.position, 'looking at: (0,0,2)');
        this.setupRenderer();
        console.log('Renderer setup complete, size:', this.renderer.getSize(new THREE.Vector2()));
        this.setupLights();
        console.log('Lights added to scene');
        this.createDashboard();
        console.log('Luxury dashboard created with PBR materials');
        this.createGauges();
        console.log('Luxury gauges created:', this.gauges.length, 'gauges with PBR materials');
        this.setupEnvironmentManager();
        console.log('Environment manager ready');
        this.setupAdvancedInteractions();
        console.log('Advanced interactions ready');
        this.animate();
        console.log('Luxury dashboard animation started - should be visible now!');
        
        // Hide loading screen
        setTimeout(() => {
            document.getElementById('loading').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('loading').style.display = 'none';
            }, 1000);
        }, 2000);
    }
    
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0B4D3B, 10, 50);
    }
    
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        // LUXURY: Perfect vintage automobile driver's seat perspective
        this.camera.position.set(0, 3, 8);
        this.camera.lookAt(0, 0, 2);
    }
    
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: document.getElementById('canvas'),
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
    }
    
    setupLights() {
        // Ambient light for overall illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Warm accent light for dashboard
        const warmLight = new THREE.PointLight(0xB7895F, 0.5, 10);
        warmLight.position.set(0, 3, 5);
        this.scene.add(warmLight);
    }
    
    createDashboard() {
        // LUXURY: Vintage curved automobile dashboard (research-based)
        const dashboardGeometry = new THREE.CylinderGeometry(
            8, 8, 0.8, 32, 1, false, 
            0, Math.PI  // Half cylinder for dashboard curve
        );
        
        const dashboardMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.charcoal,
            metalness: 0.7,
            roughness: 0.3,
            clearcoat: 0.1,
            clearcoatRoughness: 0.1
        });
        
        const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
        dashboard.rotation.x = Math.PI / 6; // Vintage automotive angle
        dashboard.rotation.y = Math.PI;     // CRITICAL: Face the curve toward user
        dashboard.position.y = -0.5;
        dashboard.castShadow = true;
        dashboard.receiveShadow = true;
        
        this.dashboardGroup.add(dashboard);
        
        // Cognac leather trim
        const leatherGeometry = new THREE.CylinderGeometry(
            7.5, 7.5, 0.15, 32, 1, false,
            0, Math.PI
        );
        
        const leatherMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.cognacLeather,
            roughness: 0.8,
            metalness: 0.1
        });
        
        const leather = new THREE.Mesh(leatherGeometry, leatherMaterial);
        leather.rotation.x = Math.PI / 6;
        leather.rotation.y = Math.PI;     // CRITICAL: Match dashboard rotation
        leather.position.y = -0.35;
        
        this.dashboardGroup.add(leather);
        
        this.scene.add(this.dashboardGroup);
    }
    
    createGauges() {
        const gaugeConfigs = [
            { 
                name: 'Performance', 
                position: { x: 0, y: 0.2, z: 3 }, 
                value: this.salesData.quarterProgress, 
                max: 100,
                size: 1.5,
                color: this.colors.racingGreen 
            },
            { 
                name: 'Revenue', 
                position: { x: -4, y: 0.5, z: 5 }, 
                value: (this.salesData.revenue / this.salesData.quota) * 100, 
                max: 150,
                size: 1.2,
                color: this.colors.amber 
            },
            { 
                name: 'Pipeline', 
                position: { x: 4, y: 0.5, z: 5 }, 
                value: 75, 
                max: 100,
                size: 1.2,
                color: this.colors.silver 
            },
            { 
                name: 'Velocity', 
                position: { x: -2.5, y: 0.8, z: 6.5 }, 
                value: 30, 
                max: 50,
                size: 1.0,
                color: this.colors.roseGold 
            },
            { 
                name: 'Ranking', 
                position: { x: 2.5, y: 0.8, z: 6.5 }, 
                value: 97, 
                max: 100,
                size: 1.0,
                color: this.colors.cream 
            }
        ];
        
        gaugeConfigs.forEach((config, index) => {
            const gauge = this.createGauge(config);
            this.gauges.push(gauge);
            this.dashboardGroup.add(gauge.group);
        });
    }
    
    createGauge(config) {
        const group = new THREE.Group();
        
        // LUXURY: Crystal-clear gauge face (research-verified)
        const faceGeometry = new THREE.CylinderGeometry(config.size, config.size, 0.1, 32);
        const faceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x000000,
            metalness: 0.9,
            roughness: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            reflectivity: 0.9
        });
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(config.position.x, config.position.y + 0.15, config.position.z);
        face.rotation.x = -Math.PI / 2;
        face.castShadow = true;
        face.receiveShadow = true;
        group.add(face);
        
        // LUXURY: Brushed aluminum rim
        const rimGeometry = new THREE.TorusGeometry(config.size + 0.1, 0.15, 8, 32);
        const rimMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.silver,
            metalness: 1.0,
            roughness: 0.3,
            clearcoat: 0.5
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(config.position.x, config.position.y + 0.15, config.position.z);
        rim.rotation.x = -Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);
        
        // LUXURY: Precision needle (cone geometry for watch-like appearance)
        const needleGeometry = new THREE.ConeGeometry(0.03, config.size * 0.8, 8);
        const needleMaterial = new THREE.MeshPhysicalMaterial({
            color: config.color,
            metalness: 0.8,
            roughness: 0.2,
            emissive: config.color,
            emissiveIntensity: 0.3,
            clearcoat: 0.8
        });
        
        const needle = new THREE.Mesh(needleGeometry, needleMaterial);
        needle.position.set(config.position.x, config.position.y + 0.2, config.position.z);
        needle.rotation.z = this.valueToAngle(config.value, config.max);
        needle.rotation.x = -Math.PI / 2; // Point needle correctly
        needle.castShadow = true;
        group.add(needle);
        
        // LUXURY: Rose gold center hub
        const hubGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16);
        const hubMaterial = new THREE.MeshPhysicalMaterial({
            color: this.colors.roseGold,
            metalness: 1.0,
            roughness: 0.1,
            clearcoat: 0.9
        });
        
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.position.set(config.position.x, config.position.y + 0.2, config.position.z);
        hub.rotation.x = -Math.PI / 2;
        hub.castShadow = true;
        group.add(hub);
        
        // Luxury scale markings
        this.createScaleMarkings(group, config);
        
        return {
            group: group,
            needle: needle,
            config: config,
            currentValue: config.value,
            targetValue: config.value
        };
    }
    
    createScaleMarkings(group, config) {
        const markings = 12;
        for (let i = 0; i <= markings; i++) {
            const angle = -Math.PI * 0.75 + (Math.PI * 1.5 * i / markings);
            const x = Math.cos(angle) * (config.size * 0.85);
            const z = Math.sin(angle) * (config.size * 0.85);
            
            // Major and minor markings like luxury watch
            const isMajor = i % 3 === 0;
            const markGeometry = new THREE.BoxGeometry(
                isMajor ? 0.08 : 0.04, 
                0.03, 
                isMajor ? 0.2 : 0.1
            );
            const markMaterial = new THREE.MeshPhysicalMaterial({ 
                color: this.colors.cream,
                emissive: this.colors.cream,
                emissiveIntensity: 0.4,
                metalness: 0.3,
                roughness: 0.2
            });
            
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.position.set(
                config.position.x + x, 
                config.position.y + 0.16, 
                config.position.z + z
            );
            mark.rotation.x = -Math.PI / 2;
            mark.castShadow = true;
            
            group.add(mark);
        }
    }
    
    valueToAngle(value, max) {
        const normalizedValue = Math.min(value / max, 1);
        // Classic gauge sweep: -135° to +135° (270° total)
        return -Math.PI * 0.75 + (Math.PI * 1.5 * normalizedValue);
    }
    
    setupEnvironmentManager() {
        try {
            this.environmentManager = new EnvironmentManager(this.scene);
        } catch (error) {
            console.warn('Environment manager failed to initialize:', error);
            // Create simple fallback background
            this.createSimpleBackground();
        }
    }
    
    setupAdvancedInteractions() {
        try {
            this.advancedInteractions = new AdvancedInteractions(this);
        } catch (error) {
            console.warn('Advanced interactions failed to initialize:', error);
            // Fall back to basic event listeners
            this.setupBasicEventListeners();
        }
    }
    
    createSimpleBackground() {
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        
        for (let i = 0; i < 1000; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            );
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            sizeAttenuation: true
        });
        
        this.backgroundEnvironment = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.backgroundEnvironment);
    }
    
    setupBasicEventListeners() {
        const canvas = document.getElementById('canvas');
        canvas.addEventListener('click', (event) => {
            // Basic click interaction
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            const intersects = raycaster.intersectObjects(
                this.gauges.map(g => g.group.children).flat()
            );
            
            if (intersects.length > 0) {
                const gauge = this.gauges.find(g => g.group.children.includes(intersects[0].object));
                if (gauge) {
                    this.animateGaugeValue(gauge, gauge.config.value + Math.random() * 20 - 10);
                }
            }
        });
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => this.onWindowResize());
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    
    animateGaugeValue(gauge, newValue) {
        const targetAngle = this.valueToAngle(newValue, gauge.config.max);
        
        // Smooth animation using TWEEN or custom animation
        const startAngle = gauge.needle.rotation.z;
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth needle movement
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            gauge.needle.rotation.z = startAngle + (targetAngle - startAngle) * easeProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    updateSalesData() {
        // Simulate real-time data updates
        this.salesData.quarterProgress += (Math.random() - 0.5) * 2;
        this.salesData.quarterProgress = Math.max(0, Math.min(100, this.salesData.quarterProgress));
        
        // Update HUD
        document.getElementById('quarter-progress').textContent = Math.round(this.salesData.quarterProgress) + '%';
        
        // Update main gauge
        if (this.gauges[0]) {
            this.animateGaugeValue(this.gauges[0], this.salesData.quarterProgress);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Animate environment
        if (this.environmentManager && this.environmentManager.animate) {
            this.environmentManager.animate();
        } else if (this.backgroundEnvironment) {
            this.backgroundEnvironment.rotation.y += 0.0002;
        }
        
        // Subtle dashboard breathing effect
        this.dashboardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.02;
        
        // Update data occasionally
        if (Math.random() < 0.001) {
            this.updateSalesData();
        }
        
        // Dynamic environment switching based on performance
        if (this.environmentManager && this.environmentManager.switchEnvironment && Math.random() < 0.0001) {
            const performance = this.salesData.quarterProgress;
            this.environmentManager.switchEnvironment('auto', performance);
        }
        
        this.renderer.render(this.scene, this.camera);
    }
}

// Dashboard will be initialized from index.html after all scripts load