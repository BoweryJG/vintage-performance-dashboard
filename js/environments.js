class EnvironmentManager {
    constructor(scene, particleMultiplier = 1.0) {
        this.scene = scene;
        this.currentEnvironment = null;
        this.environments = {};
        this.transitionDuration = 3000;
        this.particleMultiplier = particleMultiplier;
        
        this.createEnvironments();
    }
    
    createEnvironments() {
        this.environments = {
            space: this.createSpaceEnvironment(),
            ocean: this.createOceanEnvironment(),
            desert: this.createDesertEnvironment(),
            forest: this.createForestEnvironment(),
            tundra: this.createTundraEnvironment()
        };
        
        // Start with space environment
        this.switchEnvironment('space');
    }
    
    createSpaceEnvironment() {
        const group = new THREE.Group();
        
        // Stars
        const starGeometry = new THREE.BufferGeometry();
        const starPositions = [];
        const starColors = [];
        
        const starCount = Math.floor(2000 * this.particleMultiplier);
        for (let i = 0; i < starCount; i++) {
            starPositions.push(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
            
            // Vary star colors
            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.2 + 0.5, 0.5, Math.random() * 0.5 + 0.5);
            starColors.push(color.r, color.g, color.b);
        }
        
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.15,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        group.add(stars);
        
        // Nebula clouds
        const nebulaGeometry = new THREE.SphereGeometry(50, 32, 32);
        const nebulaMaterial = new THREE.MeshBasicMaterial({
            color: 0x4B0082,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        
        const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
        group.add(nebula);
        
        // Shooting stars
        const shootingStarCount = Math.floor(5 * this.particleMultiplier);
        for (let i = 0; i < shootingStarCount; i++) {
            const shootingStar = this.createShootingStar();
            group.add(shootingStar);
        }
        
        return {
            group: group,
            animate: () => {
                stars.rotation.y += 0.0001;
                nebula.rotation.x += 0.0002;
                nebula.rotation.y += 0.0001;
                
                // Animate shooting stars with smooth trails
                group.children.forEach(child => {
                    if (child.userData.isShootingStar) {
                        child.position.x -= 0.15;
                        child.position.y -= 0.08;
                        
                        // Add slight variation to make movement more organic
                        child.position.x += Math.sin(Date.now() * 0.01) * 0.01;
                        child.position.y += Math.cos(Date.now() * 0.008) * 0.005;
                        
                        // Reset position when off screen
                        if (child.position.x < -100) {
                            child.position.set(
                                Math.random() * 50 + 50,
                                Math.random() * 20 + 10,
                                Math.random() * 20 - 10
                            );
                        }
                    }
                });
            }
        };
    }
    
    createOceanEnvironment() {
        const group = new THREE.Group();
        
        // Ocean floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const floorMaterial = new THREE.MeshPhongMaterial({
            color: 0x1e3a5f,
            transparent: true,
            opacity: 0.8
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -10;
        group.add(floor);
        
        // Water particles
        const particleGeometry = new THREE.BufferGeometry();
        const particlePositions = [];
        
        const particleCount = Math.floor(1000 * this.particleMultiplier);
        for (let i = 0; i < particleCount; i++) {
            particlePositions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50,
                (Math.random() - 0.5) * 100
            );
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x87CEEB,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(particleGeometry, particleMaterial);
        group.add(particles);
        
        // Coral structures
        const coralCount = Math.floor(8 * this.particleMultiplier);
        for (let i = 0; i < coralCount; i++) {
            const coral = this.createCoral();
            coral.position.set(
                (Math.random() - 0.5) * 80,
                -8,
                (Math.random() - 0.5) * 80
            );
            group.add(coral);
        }
        
        return {
            group: group,
            animate: () => {
                particles.rotation.y += 0.0005;
                
                // Animate water particles
                const positions = particles.geometry.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.01;
                }
                particles.geometry.attributes.position.needsUpdate = true;
            }
        };
    }
    
    createDesertEnvironment() {
        const group = new THREE.Group();
        
        // Desert floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200, 100, 100);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0xDEB887
        });
        
        // Add height variation
        const positions = floorGeometry.attributes.position.array;
        for (let i = 2; i < positions.length; i += 3) {
            positions[i] = Math.random() * 2 - 1;
        }
        floorGeometry.computeVertexNormals();
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        group.add(floor);
        
        // Sand particles
        const sandGeometry = new THREE.BufferGeometry();
        const sandPositions = [];
        
        const sandParticleCount = Math.floor(500 * this.particleMultiplier);
        for (let i = 0; i < sandParticleCount; i++) {
            sandPositions.push(
                (Math.random() - 0.5) * 150,
                Math.random() * 30,
                (Math.random() - 0.5) * 150
            );
        }
        
        sandGeometry.setAttribute('position', new THREE.Float32BufferAttribute(sandPositions, 3));
        
        const sandMaterial = new THREE.PointsMaterial({
            color: 0xF4A460,
            size: 0.2,
            transparent: true,
            opacity: 0.4
        });
        
        const sand = new THREE.Points(sandGeometry, sandMaterial);
        group.add(sand);
        
        // Desert plants
        const cactusCount = Math.floor(12 * this.particleMultiplier);
        for (let i = 0; i < cactusCount; i++) {
            const cactus = this.createCactus();
            cactus.position.set(
                (Math.random() - 0.5) * 100,
                -5,
                (Math.random() - 0.5) * 100
            );
            group.add(cactus);
        }
        
        return {
            group: group,
            animate: () => {
                sand.rotation.y += 0.0003;
                
                // Heat shimmer effect
                const positions = sand.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += Math.sin(Date.now() * 0.002 + i) * 0.02;
                    positions[i + 1] += Math.cos(Date.now() * 0.002 + i) * 0.01;
                }
                sand.geometry.attributes.position.needsUpdate = true;
            }
        };
    }
    
    createForestEnvironment() {
        const group = new THREE.Group();
        
        // Forest floor
        const floorGeometry = new THREE.PlaneGeometry(200, 200);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0x2F4F2F
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        group.add(floor);
        
        // Trees
        const treeCount = Math.floor(20 * this.particleMultiplier);
        for (let i = 0; i < treeCount; i++) {
            const tree = this.createTree();
            tree.position.set(
                (Math.random() - 0.5) * 120,
                -5,
                (Math.random() - 0.5) * 120
            );
            group.add(tree);
        }
        
        // Fireflies
        const fireflyGeometry = new THREE.BufferGeometry();
        const fireflyPositions = [];
        
        const fireflyCount = Math.floor(100 * this.particleMultiplier);
        for (let i = 0; i < fireflyCount; i++) {
            fireflyPositions.push(
                (Math.random() - 0.5) * 80,
                Math.random() * 20,
                (Math.random() - 0.5) * 80
            );
        }
        
        fireflyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(fireflyPositions, 3));
        
        const fireflyMaterial = new THREE.PointsMaterial({
            color: 0xFFFF99,
            size: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        const fireflies = new THREE.Points(fireflyGeometry, fireflyMaterial);
        group.add(fireflies);
        
        return {
            group: group,
            animate: () => {
                // Animate fireflies
                const positions = fireflies.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.02;
                    positions[i + 1] += Math.cos(Date.now() * 0.0015 + i) * 0.015;
                    positions[i + 2] += Math.sin(Date.now() * 0.0008 + i) * 0.025;
                }
                fireflies.geometry.attributes.position.needsUpdate = true;
            }
        };
    }
    
    createTundraEnvironment() {
        const group = new THREE.Group();
        
        // Snow-covered ground
        const floorGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
        const floorMaterial = new THREE.MeshLambertMaterial({
            color: 0xF0F8FF
        });
        
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.position.y = -5;
        group.add(floor);
        
        // Snow particles
        const snowGeometry = new THREE.BufferGeometry();
        const snowPositions = [];
        
        const snowCount = Math.floor(800 * this.particleMultiplier);
        for (let i = 0; i < snowCount; i++) {
            snowPositions.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 50 + 10,
                (Math.random() - 0.5) * 100
            );
        }
        
        snowGeometry.setAttribute('position', new THREE.Float32BufferAttribute(snowPositions, 3));
        
        const snowMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 0.2,
            transparent: true,
            opacity: 0.8
        });
        
        const snow = new THREE.Points(snowGeometry, snowMaterial);
        group.add(snow);
        
        // Ice formations
        const iceCount = Math.floor(10 * this.particleMultiplier);
        for (let i = 0; i < iceCount; i++) {
            const ice = this.createIceFormation();
            ice.position.set(
                (Math.random() - 0.5) * 80,
                -3,
                (Math.random() - 0.5) * 80
            );
            group.add(ice);
        }
        
        return {
            group: group,
            animate: () => {
                // Falling snow
                const positions = snow.geometry.attributes.position.array;
                for (let i = 1; i < positions.length; i += 3) {
                    positions[i] -= 0.05;
                    if (positions[i] < -5) {
                        positions[i] = 60;
                    }
                }
                snow.geometry.attributes.position.needsUpdate = true;
            }
        };
    }
    
    // Helper methods for creating environment objects
    createShootingStar() {
        // Create a more authentic shooting star with a trail
        const group = new THREE.Group();
        
        // Main star point
        const starGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const starMaterial = new THREE.MeshLambertMaterial({
            color: 0xFFFFFF,
            emissive: 0xFFFFFF,
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 1.0
        });
        
        const star = new THREE.Mesh(starGeometry, starMaterial);
        group.add(star);
        
        // Create trail effect with multiple smaller spheres
        for (let i = 1; i <= 8; i++) {
            const trailGeometry = new THREE.SphereGeometry(0.02 * (1 - i * 0.1), 6, 6);
            const trailMaterial = new THREE.MeshLambertMaterial({
                color: 0xFFFFFF,
                emissive: 0xFFFFFF,
                emissiveIntensity: 0.4 * (1 - i * 0.1),
                transparent: true,
                opacity: 0.8 * (1 - i * 0.1)
            });
            
            const trailPoint = new THREE.Mesh(trailGeometry, trailMaterial);
            trailPoint.position.set(i * 0.3, i * 0.15, 0); // Trail behind the star
            group.add(trailPoint);
        }
        
        group.userData.isShootingStar = true;
        group.position.set(
            Math.random() * 50 + 50,
            Math.random() * 20 + 10,
            Math.random() * 20 - 10
        );
        group.rotation.z = Math.PI / 6; // Less steep angle
        
        return group;
    }
    
    createCoral() {
        const group = new THREE.Group();
        const geometry = new THREE.ConeGeometry(0.5, 3, 8);
        const material = new THREE.MeshLambertMaterial({
            color: Math.random() > 0.5 ? 0xFF6347 : 0xFF69B4
        });
        
        const coral = new THREE.Mesh(geometry, material);
        group.add(coral);
        
        return group;
    }
    
    createCactus() {
        const group = new THREE.Group();
        const geometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
        const material = new THREE.MeshLambertMaterial({
            color: 0x228B22
        });
        
        const cactus = new THREE.Mesh(geometry, material);
        cactus.position.y = 2;
        group.add(cactus);
        
        return group;
    }
    
    createTree() {
        const group = new THREE.Group();
        
        // Trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.5, 6, 8);
        const trunkMaterial = new THREE.MeshLambertMaterial({
            color: 0x8B4513
        });
        
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 3;
        group.add(trunk);
        
        // Leaves
        const leavesGeometry = new THREE.SphereGeometry(3, 16, 16);
        const leavesMaterial = new THREE.MeshLambertMaterial({
            color: 0x228B22
        });
        
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 7;
        group.add(leaves);
        
        return group;
    }
    
    createIceFormation() {
        const group = new THREE.Group();
        const geometry = new THREE.ConeGeometry(1, 4, 6);
        const material = new THREE.MeshLambertMaterial({
            color: 0xE0FFFF,
            transparent: true,
            opacity: 0.8
        });
        
        const ice = new THREE.Mesh(geometry, material);
        ice.position.y = 2;
        group.add(ice);
        
        return group;
    }
    
    switchEnvironment(environmentName, performanceLevel = 100) {
        // Choose environment based on performance
        let targetEnv = environmentName;
        if (performanceLevel >= 90) targetEnv = 'space';
        else if (performanceLevel >= 70) targetEnv = 'ocean';
        else if (performanceLevel >= 50) targetEnv = 'forest';
        else if (performanceLevel >= 30) targetEnv = 'desert';
        else targetEnv = 'tundra';
        
        if (this.currentEnvironment) {
            this.scene.remove(this.currentEnvironment.group);
        }
        
        this.currentEnvironment = this.environments[targetEnv];
        this.scene.add(this.currentEnvironment.group);
        
        // Fade in effect
        this.currentEnvironment.group.traverse((child) => {
            if (child.material) {
                child.material.transparent = true;
                child.material.opacity = 0;
                
                // Animate opacity
                let opacity = 0;
                const fadeIn = () => {
                    opacity += 0.02;
                    child.material.opacity = Math.min(opacity, child.material.userData.originalOpacity || 1);
                    
                    if (opacity < 1) {
                        requestAnimationFrame(fadeIn);
                    }
                };
                fadeIn();
            }
        });
    }
    
    animate() {
        if (this.currentEnvironment && this.currentEnvironment.animate) {
            this.currentEnvironment.animate();
        }
    }
    
    updatePerformanceMultiplier(newMultiplier) {
        this.particleMultiplier = newMultiplier;
        
        // Recreate environments with new performance settings
        const currentEnvName = this.getCurrentEnvironmentName();
        this.createEnvironments();
        
        // Switch to the current environment to apply changes
        if (currentEnvName) {
            this.switchEnvironment(currentEnvName);
        }
    }
    
    getCurrentEnvironmentName() {
        for (const [name, env] of Object.entries(this.environments)) {
            if (env === this.currentEnvironment) {
                return name;
            }
        }
        return 'space'; // Default fallback
    }
}