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
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupLights();
        this.createDashboard();
        this.createGauges();
        this.setupEnvironmentManager();
        this.setupAdvancedInteractions();
        this.animate();
        
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
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.set(0, 2, 8);
        this.camera.lookAt(0, 0, 0);
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
        // Main dashboard base
        const dashboardGeometry = new THREE.CylinderGeometry(6, 6, 0.5, 32, 1, false, 0, Math.PI);
        const dashboardMaterial = new THREE.MeshLambertMaterial({
            color: this.colors.charcoal
        });
        
        const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
        dashboard.rotation.z = Math.PI;
        dashboard.position.y = -0.25;
        dashboard.receiveShadow = true;
        
        this.dashboardGroup.add(dashboard);
        
        // Leather padding
        const leatherGeometry = new THREE.CylinderGeometry(5.8, 5.8, 0.1, 32, 1, false, 0, Math.PI);
        const leatherMaterial = new THREE.MeshLambertMaterial({
            color: this.colors.cognacLeather
        });
        
        const leather = new THREE.Mesh(leatherGeometry, leatherMaterial);
        leather.rotation.z = Math.PI;
        leather.position.y = 0.05;
        
        this.dashboardGroup.add(leather);
        
        this.scene.add(this.dashboardGroup);
    }
    
    createGauges() {
        const gaugeConfigs = [
            { 
                name: 'Performance', 
                position: { x: 0, y: 0, z: 0 }, 
                value: this.salesData.quarterProgress, 
                max: 100,
                size: 1.5,
                color: this.colors.racingGreen 
            },
            { 
                name: 'Revenue', 
                position: { x: -3, y: 0, z: 1 }, 
                value: (this.salesData.revenue / this.salesData.quota) * 100, 
                max: 150,
                size: 1.0,
                color: this.colors.amber 
            },
            { 
                name: 'Pipeline', 
                position: { x: 3, y: 0, z: 1 }, 
                value: 75, 
                max: 100,
                size: 1.0,
                color: this.colors.silver 
            },
            { 
                name: 'Velocity', 
                position: { x: -2, y: 0, z: 2.5 }, 
                value: 30, 
                max: 50,
                size: 0.8,
                color: this.colors.roseGold 
            },
            { 
                name: 'Ranking', 
                position: { x: 2, y: 0, z: 2.5 }, 
                value: 97, 
                max: 100,
                size: 0.8,
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
        
        // Gauge face
        const faceGeometry = new THREE.CylinderGeometry(config.size, config.size, 0.1, 32);
        const faceMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000
        });
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(config.position.x, config.position.y + 0.1, config.position.z);
        group.add(face);
        
        // Gauge rim
        const rimGeometry = new THREE.TorusGeometry(config.size, 0.1, 8, 32);
        const rimMaterial = new THREE.MeshLambertMaterial({
            color: this.colors.silver
        });
        
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.position.set(config.position.x, config.position.y + 0.1, config.position.z);
        rim.rotation.x = -Math.PI / 2;
        group.add(rim);
        
        // Needle
        const needleGeometry = new THREE.ConeGeometry(0.02, config.size * 0.8, 8);
        const needleMaterial = new THREE.MeshPhongMaterial({
            color: config.color,
            shininess: 100,
            emissive: config.color,
            emissiveIntensity: 0.2
        });
        
        const needle = new THREE.Mesh(needleGeometry, needleMaterial);
        needle.position.set(config.position.x, config.position.y + 0.2, config.position.z);
        needle.rotation.z = this.valueToAngle(config.value, config.max);
        group.add(needle);
        
        // Center hub
        const hubGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 16);
        const hubMaterial = new THREE.MeshLambertMaterial({
            color: this.colors.roseGold
        });
        
        const hub = new THREE.Mesh(hubGeometry, hubMaterial);
        hub.position.set(config.position.x, config.position.y + 0.15, config.position.z);
        group.add(hub);
        
        // Scale markings
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
        const markings = 10;
        for (let i = 0; i <= markings; i++) {
            const angle = -Math.PI * 0.75 + (Math.PI * 1.5 * i / markings);
            const x = Math.cos(angle) * (config.size * 0.9);
            const z = Math.sin(angle) * (config.size * 0.9);
            
            const markGeometry = new THREE.BoxGeometry(0.02, 0.02, 0.1);
            const markMaterial = new THREE.MeshBasicMaterial({ color: this.colors.cream });
            
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.position.set(
                config.position.x + x, 
                config.position.y + 0.15, 
                config.position.z + z
            );
            
            group.add(mark);
        }
    }
    
    valueToAngle(value, max) {
        const normalizedValue = Math.min(value / max, 1);
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

// Initialize the dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    new LuxuryDashboard();
});