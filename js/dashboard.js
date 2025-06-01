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
        console.log('Camera position:', this.camera.position.x, this.camera.position.y, this.camera.position.z, 'looking at: (0,0,2)');
        this.setupRenderer();
        const size = new THREE.Vector2();
        this.renderer.getSize(size);
        console.log('Renderer setup complete, size:', size.x, 'x', size.y);
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
        try {
            this.scene = new THREE.Scene();
            const bgColor = new THREE.Color(0x001122);
            this.scene.background = bgColor;
            this.scene.fog = new THREE.Fog(0x0B4D3B, 10, 50);
            console.log('Scene background set to:', bgColor.getHexString());
        } catch (error) {
            console.error('Scene setup error:', error);
        }
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
            alpha: false  // CRITICAL: Disable alpha for solid background
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;
        this.renderer.setClearColor(0x001122, 1.0); // FORCE clear color
        console.log('Renderer configured with solid background');
    }
    
    setupLights() {
        // BRIGHT ambient light for visibility
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        this.scene.add(ambientLight);
        console.log('Bright ambient light added');
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(5, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        console.log('Directional light added');
        
        // Warm accent light for dashboard
        const warmLight = new THREE.PointLight(0xB7895F, 1.0, 20);
        warmLight.position.set(0, 3, 5);
        this.scene.add(warmLight);
        console.log('Warm accent light added');
    }
    
    createDashboard() {
        // VINTAGE: Carbon fiber and wood grain dashboard panel
        const dashboardGeometry = new THREE.CylinderGeometry(
            8, 8, 0.8, 64, 1, false, 
            0, Math.PI  // Half cylinder for dashboard curve
        );
        
        const dashboardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x1a1a1a, // Deep black for carbon fiber look
            metalness: 0.8,
            roughness: 0.4,
            clearcoat: 0.9,
            clearcoatRoughness: 0.1,
            normalScale: new THREE.Vector2(0.5, 0.5) // Carbon fiber texture
        });
        
        const dashboard = new THREE.Mesh(dashboardGeometry, dashboardMaterial);
        dashboard.rotation.x = Math.PI / 6;
        dashboard.rotation.y = Math.PI;
        dashboard.position.y = -0.5;
        dashboard.castShadow = true;
        dashboard.receiveShadow = true;
        
        this.dashboardGroup.add(dashboard);
        
        // Polished walnut wood trim (classic luxury automotive)
        const woodTrimGeometry = new THREE.CylinderGeometry(
            7.5, 7.5, 0.18, 64, 1, false,
            0, Math.PI
        );
        
        const woodTrimMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x5D4E37, // Walnut brown
            roughness: 0.3,
            metalness: 0.0,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1,
            normalScale: new THREE.Vector2(0.8, 0.8) // Wood grain texture
        });
        
        const woodTrim = new THREE.Mesh(woodTrimGeometry, woodTrimMaterial);
        woodTrim.rotation.x = Math.PI / 6;
        woodTrim.rotation.y = Math.PI;
        woodTrim.position.y = -0.35;
        
        this.dashboardGroup.add(woodTrim);
        
        // Add brushed aluminum accent strips
        this.createAccentStrips();
        
        // Add vintage dashboard lighting
        this.createDashboardLighting();
        
        this.scene.add(this.dashboardGroup);
    }
    
    createAccentStrips() {
        const stripCount = 3;
        for (let i = 0; i < stripCount; i++) {
            const stripGeometry = new THREE.CylinderGeometry(
                7.3 - i * 0.3, 7.3 - i * 0.3, 0.02, 32, 1, false,
                0, Math.PI
            );
            
            const stripMaterial = new THREE.MeshPhysicalMaterial({
                color: 0xc0c0c0, // Brushed aluminum
                metalness: 1.0,
                roughness: 0.2,
                clearcoat: 0.8,
                clearcoatRoughness: 0.1
            });
            
            const strip = new THREE.Mesh(stripGeometry, stripMaterial);
            strip.rotation.x = Math.PI / 6;
            strip.rotation.y = Math.PI;
            strip.position.y = -0.25 - i * 0.1;
            
            this.dashboardGroup.add(strip);
        }
    }
    
    createDashboardLighting() {
        // Warm ambient dashboard lighting (like vintage car at night)
        const dashboardLight = new THREE.SpotLight(0xffb366, 0.8, 15, Math.PI / 6, 0.5);
        dashboardLight.position.set(0, 5, 8);
        dashboardLight.target.position.set(0, 0, 2);
        dashboardLight.castShadow = true;
        dashboardLight.shadow.mapSize.width = 1024;
        dashboardLight.shadow.mapSize.height = 1024;
        
        this.scene.add(dashboardLight);
        this.scene.add(dashboardLight.target);
        
        // Blue accent lighting for performance feel
        const accentLight = new THREE.PointLight(0x4488ff, 0.3, 12);
        accentLight.position.set(-3, 2, 6);
        this.scene.add(accentLight);
        
        const accentLight2 = new THREE.PointLight(0x4488ff, 0.3, 12);
        accentLight2.position.set(3, 2, 6);
        this.scene.add(accentLight2);
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
        
        // VINTAGE: Brushed aluminum gauge face with radial texture
        const faceGeometry = new THREE.CylinderGeometry(config.size, config.size, 0.12, 64);
        const faceMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2a2a2a,
            metalness: 0.95,
            roughness: 0.25,
            clearcoat: 0.8,
            clearcoatRoughness: 0.15,
            reflectivity: 0.8,
            // Add subtle noise for brushed metal texture
            normalScale: new THREE.Vector2(0.3, 0.3)
        });
        
        const face = new THREE.Mesh(faceGeometry, faceMaterial);
        face.position.set(config.position.x, config.position.y + 0.15, config.position.z);
        face.rotation.x = -Math.PI / 2;
        face.castShadow = true;
        face.receiveShadow = true;
        group.add(face);
        
        // VINTAGE: Chamfered chrome bezel with screw heads
        const bezelGeometry = new THREE.TorusGeometry(config.size + 0.12, 0.18, 12, 48);
        const bezelMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xc0c0c0,
            metalness: 1.0,
            roughness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            reflectivity: 1.0
        });
        
        const bezel = new THREE.Mesh(bezelGeometry, bezelMaterial);
        bezel.position.set(config.position.x, config.position.y + 0.15, config.position.z);
        bezel.rotation.x = -Math.PI / 2;
        bezel.castShadow = true;
        group.add(bezel);
        
        // Add chrome screw heads around bezel
        this.createScrewHeads(group, config);
        
        // VINTAGE: Chrome-tipped needle with vintage tachometer style
        const needleGroup = new THREE.Group();
        
        // Main needle shaft
        const needleShaftGeometry = new THREE.CylinderGeometry(0.02, 0.04, config.size * 0.7, 8);
        const needleShaftMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8B0000, // Deep red
            metalness: 0.3,
            roughness: 0.4,
            clearcoat: 0.9,
            clearcoatRoughness: 0.1
        });
        
        const needleShaft = new THREE.Mesh(needleShaftGeometry, needleShaftMaterial);
        needleShaft.position.y = config.size * 0.35;
        needleShaft.rotation.z = Math.PI / 2;
        needleGroup.add(needleShaft);
        
        // Chrome needle tip
        const needleTipGeometry = new THREE.ConeGeometry(0.08, 0.25, 8);
        const needleTipMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 1.0,
            roughness: 0.05,
            clearcoat: 1.0,
            clearcoatRoughness: 0.02,
            reflectivity: 1.0
        });
        
        const needleTip = new THREE.Mesh(needleTipGeometry, needleTipMaterial);
        needleTip.position.y = config.size * 0.65;
        needleTip.rotation.z = Math.PI / 2;
        needleGroup.add(needleTip);
        
        // Position and rotate the entire needle
        needleGroup.position.set(config.position.x, config.position.y + 0.18, config.position.z);
        needleGroup.rotation.z = this.valueToAngle(config.value, config.max);
        needleGroup.rotation.x = -Math.PI / 2;
        needleGroup.castShadow = true;
        group.add(needleGroup);
        
        // VINTAGE: Steel center bolt with hex head
        const centerBoltGeometry = new THREE.CylinderGeometry(0.18, 0.18, 0.12, 6);
        const centerBoltMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x404040,
            metalness: 1.0,
            roughness: 0.2,
            clearcoat: 0.8,
            clearcoatRoughness: 0.1
        });
        
        const centerBolt = new THREE.Mesh(centerBoltGeometry, centerBoltMaterial);
        centerBolt.position.set(config.position.x, config.position.y + 0.21, config.position.z);
        centerBolt.rotation.x = -Math.PI / 2;
        centerBolt.castShadow = true;
        group.add(centerBolt);
        
        // Add glass reflection overlay
        this.createGlassOverlay(group, config);
        
        // Enhanced scale markings with vintage style
        this.createVintageScaleMarkings(group, config);
        
        // Add danger zones (red zones)
        this.createDangerZones(group, config);
        
        return {
            group: group,
            needle: needleGroup,
            config: config,
            currentValue: config.value,
            targetValue: config.value
        };
    }
    
    createScrewHeads(group, config) {
        const screwCount = 8;
        for (let i = 0; i < screwCount; i++) {
            const angle = (Math.PI * 2 * i) / screwCount;
            const radius = config.size + 0.25;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            const screwGeometry = new THREE.CylinderGeometry(0.06, 0.06, 0.08, 6);
            const screwMaterial = new THREE.MeshPhysicalMaterial({
                color: 0x808080,
                metalness: 1.0,
                roughness: 0.3,
                clearcoat: 0.8
            });
            
            const screw = new THREE.Mesh(screwGeometry, screwMaterial);
            screw.position.set(
                config.position.x + x,
                config.position.y + 0.19,
                config.position.z + z
            );
            screw.rotation.x = -Math.PI / 2;
            screw.castShadow = true;
            group.add(screw);
        }
    }
    
    createGlassOverlay(group, config) {
        const glassGeometry = new THREE.CylinderGeometry(config.size + 0.05, config.size + 0.05, 0.02, 64);
        const glassMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.0,
            roughness: 0.0,
            transmission: 0.95,
            transparent: true,
            opacity: 0.1,
            clearcoat: 1.0,
            clearcoatRoughness: 0.0,
            ior: 1.5
        });
        
        const glass = new THREE.Mesh(glassGeometry, glassMaterial);
        glass.position.set(config.position.x, config.position.y + 0.22, config.position.z);
        glass.rotation.x = -Math.PI / 2;
        group.add(glass);
    }
    
    createVintageScaleMarkings(group, config) {
        const markings = 20;
        for (let i = 0; i <= markings; i++) {
            const angle = -Math.PI * 0.75 + (Math.PI * 1.5 * i / markings);
            const x = Math.cos(angle) * (config.size * 0.8);
            const z = Math.sin(angle) * (config.size * 0.8);
            
            // Major, medium, and minor markings
            const isMajor = i % 5 === 0;
            const isMedium = i % 2 === 0 && !isMajor;
            
            let markHeight, markWidth, markDepth;
            if (isMajor) {
                markHeight = 0.25;
                markWidth = 0.06;
                markDepth = 0.03;
            } else if (isMedium) {
                markHeight = 0.15;
                markWidth = 0.04;
                markDepth = 0.02;
            } else {
                markHeight = 0.08;
                markWidth = 0.02;
                markDepth = 0.01;
            }
            
            const markGeometry = new THREE.BoxGeometry(markWidth, markDepth, markHeight);
            const markMaterial = new THREE.MeshPhysicalMaterial({ 
                color: isMajor ? 0xffffff : 0xe0e0e0,
                emissive: isMajor ? 0x444444 : 0x222222,
                emissiveIntensity: 0.3,
                metalness: 0.8,
                roughness: 0.2,
                clearcoat: 0.9
            });
            
            const mark = new THREE.Mesh(markGeometry, markMaterial);
            mark.position.set(
                config.position.x + x, 
                config.position.y + 0.17, 
                config.position.z + z
            );
            mark.rotation.x = -Math.PI / 2;
            mark.rotation.y = angle + Math.PI / 2;
            mark.castShadow = true;
            
            group.add(mark);
        }
    }
    
    createDangerZones(group, config) {
        // Red zone arc for danger/high values
        const dangerStartAngle = Math.PI * 0.3; // About 80% of max
        const dangerEndAngle = Math.PI * 0.75;
        
        const dangerArcGeometry = new THREE.RingGeometry(
            config.size * 0.65, 
            config.size * 0.75, 
            0, 
            32, 
            dangerStartAngle, 
            dangerEndAngle - dangerStartAngle
        );
        
        const dangerArcMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0000,
            transparent: true,
            opacity: 0.6,
            emissive: 0x440000,
            emissiveIntensity: 0.2,
            side: THREE.DoubleSide
        });
        
        const dangerArc = new THREE.Mesh(dangerArcGeometry, dangerArcMaterial);
        dangerArc.position.set(config.position.x, config.position.y + 0.16, config.position.z);
        dangerArc.rotation.x = -Math.PI / 2;
        dangerArc.rotation.z = -Math.PI * 0.75;
        group.add(dangerArc);
        
        // Yellow warning zone
        const warningStartAngle = Math.PI * 0.1;
        const warningEndAngle = Math.PI * 0.3;
        
        const warningArcGeometry = new THREE.RingGeometry(
            config.size * 0.65, 
            config.size * 0.75, 
            0, 
            32, 
            warningStartAngle, 
            warningEndAngle - warningStartAngle
        );
        
        const warningArcMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffaa00,
            transparent: true,
            opacity: 0.4,
            emissive: 0x442200,
            emissiveIntensity: 0.1,
            side: THREE.DoubleSide
        });
        
        const warningArc = new THREE.Mesh(warningArcGeometry, warningArcMaterial);
        warningArc.position.set(config.position.x, config.position.y + 0.16, config.position.z);
        warningArc.rotation.x = -Math.PI / 2;
        warningArc.rotation.z = -Math.PI * 0.75;
        group.add(warningArc);
    }
    
    createScaleMarkings(group, config) {
        // This method is now replaced by createVintageScaleMarkings
        // Keeping for backward compatibility
        this.createVintageScaleMarkings(group, config);
    }
    
    valueToAngle(value, max) {
        const normalizedValue = Math.min(value / max, 1);
        // Classic gauge sweep: -135° to +135° (270° total)
        return -Math.PI * 0.75 + (Math.PI * 1.5 * normalizedValue);
    }
    
    setupEnvironmentManager() {
        try {
            console.log('Attempting to create EnvironmentManager...');
            this.environmentManager = new EnvironmentManager(this.scene);
            console.log('EnvironmentManager created successfully');
        } catch (error) {
            console.warn('Environment manager failed to initialize:', error);
            console.log('Creating fallback background...');
            this.createSimpleBackground();
        }
    }
    
    setupAdvancedInteractions() {
        try {
            if (typeof AdvancedInteractions !== 'undefined') {
                this.advancedInteractions = new AdvancedInteractions(this);
                console.log('Advanced interactions initialized successfully');
            } else {
                console.log('AdvancedInteractions class not available, using basic interactions');
                this.setupBasicEventListeners();
            }
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
        
        // Unified interaction handler for mouse and touch
        const handleInteraction = (event) => {
            event.preventDefault();
            
            // Get coordinates (works for both mouse and touch)
            const clientX = event.touches ? event.touches[0].clientX : event.clientX;
            const clientY = event.touches ? event.touches[0].clientY : event.clientY;
            
            const mouse = new THREE.Vector2();
            mouse.x = (clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(clientY / window.innerHeight) * 2 + 1;
            
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, this.camera);
            
            // Get all gauge objects for intersection testing
            const allGaugeObjects = [];
            this.gauges.forEach(gauge => {
                // Add the main group and all its children recursively
                gauge.group.traverse((child) => {
                    if (child.isMesh) {
                        allGaugeObjects.push(child);
                    }
                });
            });
            
            const intersects = raycaster.intersectObjects(allGaugeObjects);
            
            if (intersects.length > 0) {
                console.log('Gauge clicked!', intersects[0].object);
                
                // Find which gauge was clicked
                let clickedGauge = null;
                this.gauges.forEach(gauge => {
                    gauge.group.traverse((child) => {
                        if (child === intersects[0].object) {
                            clickedGauge = gauge;
                        }
                    });
                });
                
                if (clickedGauge) {
                    // Mobile: Zoom effect on tap
                    if (event.touches) {
                        this.mobileGaugeZoom(clickedGauge);
                    }
                    
                    // Animate gauge with vintage spring physics
                    const newValue = Math.random() * clickedGauge.config.max;
                    this.animateGaugeValue(clickedGauge, newValue);
                    
                    console.log(`Animating ${clickedGauge.config.name} to ${newValue}`);
                }
            }
        };
        
        // Mouse events
        canvas.addEventListener('click', handleInteraction);
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', handleInteraction, { passive: false });
        canvas.addEventListener('touchend', (event) => {
            event.preventDefault();
        }, { passive: false });
        
        // Add window resize handler
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Start automatic gauge updates for demo
        this.startAutomaticUpdates();
    }
    
    mobileGaugeZoom(gauge) {
        // Create mobile zoom overlay for detailed gauge view
        const overlay = document.createElement('div');
        overlay.id = 'mobile-gauge-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Eurostile', 'Rajdhani', monospace;
            color: #F5F5F5;
            text-align: center;
            cursor: pointer;
        `;
        
        const title = document.createElement('h2');
        title.textContent = gauge.config.name.toUpperCase();
        title.style.cssText = `
            font-size: 24px;
            font-weight: 700;
            color: #FF6B35;
            margin-bottom: 20px;
            letter-spacing: 3px;
            text-shadow: 0 0 15px rgba(255, 107, 53, 0.8);
        `;
        
        const value = document.createElement('div');
        value.textContent = `${Math.round(gauge.config.value)} / ${gauge.config.max}`;
        value.style.cssText = `
            font-size: 48px;
            font-weight: 900;
            color: #F5F5F5;
            margin-bottom: 30px;
            text-shadow: 
                0 0 20px rgba(245, 245, 245, 0.6),
                0 2px 0 #000;
        `;
        
        const hint = document.createElement('p');
        hint.textContent = 'TAP TO CLOSE';
        hint.style.cssText = `
            font-size: 12px;
            color: rgba(255, 107, 53, 0.6);
            letter-spacing: 2px;
            animation: mobilePulse 2s ease-in-out infinite;
        `;
        
        overlay.appendChild(title);
        overlay.appendChild(value);
        overlay.appendChild(hint);
        
        // Close on tap
        overlay.addEventListener('click', () => {
            document.body.removeChild(overlay);
        });
        
        document.body.appendChild(overlay);
        
        // Auto-close after 5 seconds
        setTimeout(() => {
            if (document.getElementById('mobile-gauge-overlay')) {
                document.body.removeChild(overlay);
            }
        }, 5000);
    }
    
    startAutomaticUpdates() {
        // Make gauges come alive with automatic updates
        setInterval(() => {
            if (this.gauges && this.gauges.length > 0) {
                // Randomly update one gauge
                const randomGauge = this.gauges[Math.floor(Math.random() * this.gauges.length)];
                const newValue = Math.random() * randomGauge.config.max;
                this.animateGaugeValue(randomGauge, newValue);
                
                console.log(`Auto-updating ${randomGauge.config.name} to ${Math.round(newValue)}`);
            }
        }, 3000); // Update every 3 seconds
        
        // Also update HUD values
        setInterval(() => {
            this.updateSalesData();
        }, 5000);
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
        const startAngle = gauge.needle.rotation.z;
        const angleDistance = targetAngle - startAngle;
        
        // Performance-style animation with spring physics
        const duration = 1200; // Slightly longer for realism
        const startTime = Date.now();
        
        // Spring physics parameters
        const springK = 0.3; // Spring stiffness
        const damping = 0.85; // Damping factor
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Spring easing with overshoot and settle
            let easeProgress;
            if (progress < 0.7) {
                // Initial smooth acceleration
                easeProgress = 1 - Math.pow(1 - (progress / 0.7), 2);
            } else {
                // Spring bounce with damping
                const bounceProgress = (progress - 0.7) / 0.3;
                const springForce = Math.sin(bounceProgress * Math.PI * 4) * Math.pow(damping, bounceProgress * 8);
                easeProgress = 1 + springForce * 0.1;
            }
            
            const currentAngle = startAngle + angleDistance * easeProgress;
            gauge.needle.rotation.z = currentAngle;
            
            // Add subtle needle vibration at high values (performance stress simulation)
            if (newValue / gauge.config.max > 0.8) {
                const vibrationIntensity = (newValue / gauge.config.max - 0.8) * 0.5;
                const vibration = Math.sin(elapsed * 0.05) * vibrationIntensity * 0.01;
                gauge.needle.rotation.z += vibration;
            }
            
            // Continue animation if not complete
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                // Final settling animation
                gauge.targetValue = newValue;
                gauge.currentValue = newValue;
                this.addNeedleVibration(gauge);
                
                // Add a dramatic glow effect when animation completes
                this.addGaugeGlow(gauge);
            }
        };
        
        animate();
    }
    
    addNeedleVibration(gauge) {
        // Continuous subtle vibration for high-performance feel
        const vibrationLoop = () => {
            if (gauge.targetValue / gauge.config.max > 0.7) {
                const intensity = (gauge.targetValue / gauge.config.max - 0.7) * 0.3;
                const vibration = (Math.random() - 0.5) * intensity * 0.008;
                const baseAngle = this.valueToAngle(gauge.targetValue, gauge.config.max);
                gauge.needle.rotation.z = baseAngle + vibration;
            }
            
            // Continue vibration loop
            setTimeout(vibrationLoop, 50 + Math.random() * 50);
        };
        
        // Start vibration with random delay to avoid synchronization
        setTimeout(vibrationLoop, Math.random() * 200);
    }
    
    addGaugeGlow(gauge) {
        // Add dramatic glow effect to gauge when it updates
        const originalEmissive = {};
        
        gauge.group.traverse((child) => {
            if (child.isMesh && child.material && child.material.emissive) {
                originalEmissive[child.uuid] = child.material.emissive.getHex();
                
                // Animate glow
                const targetEmissive = 0xff6b35; // Vintage orange glow
                child.material.emissive.setHex(targetEmissive);
                child.material.emissiveIntensity = 0.5;
                
                // Fade back to original
                setTimeout(() => {
                    child.material.emissive.setHex(originalEmissive[child.uuid] || 0x000000);
                    child.material.emissiveIntensity = child.material.emissiveIntensity * 0.3;
                }, 500);
            }
        });
        
        console.log(`Added glow effect to ${gauge.config.name}`);
    }
    
    updateSalesData() {
        // Simulate real-time data updates
        this.salesData.quarterProgress += (Math.random() - 0.5) * 2;
        this.salesData.quarterProgress = Math.max(0, Math.min(100, this.salesData.quarterProgress));
        
        // Update HUD (with error handling)
        const progressElement = document.getElementById('quarter-progress');
        if (progressElement) {
            progressElement.textContent = Math.round(this.salesData.quarterProgress) + '%';
        }
        
        // Update main gauge
        if (this.gauges[0]) {
            this.animateGaugeValue(this.gauges[0], this.salesData.quarterProgress);
        }
    }
    
    animate() {
        try {
            requestAnimationFrame(() => this.animate());
            
            // Animate environment
            if (this.environmentManager && this.environmentManager.animate) {
                this.environmentManager.animate();
            } else if (this.backgroundEnvironment) {
                this.backgroundEnvironment.rotation.y += 0.0002;
            }
            
            // Subtle dashboard breathing effect
            if (this.dashboardGroup) {
                this.dashboardGroup.position.y = Math.sin(Date.now() * 0.001) * 0.02;
            }
            
            // Update data occasionally
            if (Math.random() < 0.001) {
                this.updateSalesData();
            }
            
            // Dynamic environment switching based on performance
            if (this.environmentManager && this.environmentManager.switchEnvironment && Math.random() < 0.0001) {
                const performance = this.salesData.quarterProgress;
                this.environmentManager.switchEnvironment('auto', performance);
            }
            
            // CRITICAL: Actually render the scene
            if (this.renderer && this.scene && this.camera) {
                this.renderer.render(this.scene, this.camera);
            } else {
                console.error('Missing renderer components:', {
                    renderer: !!this.renderer,
                    scene: !!this.scene, 
                    camera: !!this.camera
                });
            }
        } catch (error) {
            console.error('Animation loop error:', error);
        }
    }
}

// Dashboard will be initialized from index.html after all scripts load