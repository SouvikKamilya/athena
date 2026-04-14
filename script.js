// Matter.js Physics Engine
let engine, world, bodies = [];
const contentWrapper = document.getElementById('content-wrapper');

// Initialize Physics
function initPhysics() {
    engine = Matter.Engine.create();
    world = engine.world;
    engine.world.gravity.y = 0.5;
    
    Matter.Renderer.create({
        element: document.body,
        engine: engine,
        options: {
            width: window.innerWidth,
            height: window.innerHeight,
            wireframes: false,
            background: 'transparent'
        }
    });

    Matter.Runner.run(engine);
    Matter.Events.on(engine, 'collisionStart', handleCollision);
}

// Create physics bodies for elements
function createPhysicsBodies() {
    document.querySelectorAll('.physics-item').forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const body = Matter.Bodies.rectangle(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            rect.width,
            rect.height,
            {
                restitution: 0.6,
                frictionAir: 0.01,
                density: 0.001,
                render: { visible: false }
            }
        );
        
        bodies.push({ element: el, body, originalY: rect.top });
        Matter.World.add(world, body);
    });
}

// Handle collisions (falling effect)
function handleCollision(event) {
    event.pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;
        
        const objA = bodies.find(b => b.body === bodyA);
        const objB = bodies.find(b => b.body === bodyB);
        
        if (objA && objB) {
            // Add some rotation and bounce
            Matter.Body.setAngularVelocity(objA.body, (Math.random() - 0.5) * 0.1);
            Matter.Body.setAngularVelocity(objB.body, (Math.random() - 0.5) * 0.1);
        }
    });
}

// Animate physics elements falling
function triggerPhysicsFall() {
    setTimeout(() => {
        bodies.forEach(({ element, body }) => {
            Matter.Body.setVelocity(body, {
                x: (Math.random() - 0.5) * 10,
                y: Math.random() * 20
            });
            Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
        });
        
        // Hide content temporarily
        contentWrapper.style.opacity = '0';
        contentWrapper.style.pointerEvents = 'none';
        
        // Reset after 3 seconds
        setTimeout(() => {
            resetPhysics();
        }, 3000);
    }, 100);
}

function resetPhysics() {
    bodies.forEach(({ element, body, originalY }) => {
        Matter.Body.setPosition(body, {
            x: body.position.x,
            y: originalY + window.scrollY
        });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
    });
    
    contentWrapper.style.opacity = '1';
    contentWrapper.style.pointerEvents = 'auto';
}

// Mouse interaction with physics
document.addEventListener('mousemove', (e) => {
    if (bodies.length > 0) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        bodies.forEach(({ body }) => {
            const dx = mouseX * 0.02;
            const dy = mouseY * 0.02;
            Matter.Body.applyForce(body, body.position, { x: dx, y: dy });
        });
    }
});

// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Wait for particles.js to load
    setTimeout(() => {
        initPhysics();
        createPhysicsBodies();
    }, 1000);
    
    // Mobile Menu Toggle
    const mobileBtn = document.getElementById('mobile-btn');
    const navLinks = document.querySelector('.nav-links');

    mobileBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
        });
    });

    // Navbar Scroll Effect
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        reveal();
    });

    // Scroll Reveal
    function reveal() {
        const reveals = document.querySelectorAll('.reveal');
        reveals.forEach((el, i) => {
            const windowHeight = window.innerHeight;
            const elementTop = el.getBoundingClientRect().top;
            const elementVisible = 100;

            if (elementTop < windowHeight - elementVisible) {
                el.classList.add('active');
            }
        });
    }

    reveal();

    // Stats Counter
    const counters = document.querySelectorAll('.stat-number');
    const startCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText.replace(/[^\d]/g, '');
                const inc = target / 200;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = target + (target > 50 ? '+' : '%');
                }
            };

            if (counter.getBoundingClientRect().top < window.innerHeight) {
                updateCount();
            }
        });
    };

    window.addEventListener('scroll', startCounters, { once: true });

    // Sound effect
    const clickSound = document.getElementById('click-sound');
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mousedown', () => {
            clickSound.currentTime = 0;
            clickSound.play().catch(e => {});
        });
    });

    // Physics trigger on double-click spacebar
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.ctrlKey) {
            e.preventDefault();
            triggerPhysicsFall();
        }
    });
});