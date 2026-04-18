import { useEffect, useRef } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const cursorGlowRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true });

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // WebGL shaders for particle field
    const vsSource = `
      attribute vec3 aPos;
      attribute float aSize;
      attribute vec3 aColor;
      uniform mat4 uProj;
      uniform mat4 uView;
      uniform float uTime;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        vec3 pos = aPos;
        pos.y += sin(uTime * 0.3 + pos.x * 0.5) * 0.3;
        pos.x += cos(uTime * 0.2 + pos.z * 0.3) * 0.2;
        vec4 mvPos = uView * vec4(pos, 1.0);
        gl_Position = uProj * mvPos;
        gl_PointSize = aSize * (200.0 / -mvPos.z);
        vColor = aColor;
        float dist = length(mvPos.xyz);
        vAlpha = smoothstep(30.0, 5.0, dist) * 0.7;
      }
    `;

    const fsSource = `
      precision mediump float;
      varying vec3 vColor;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5) * 2.0;
        float alpha = smoothstep(1.0, 0.0, d) * vAlpha;
        gl_FragColor = vec4(vColor, alpha);
      }
    `;

    const lineVS = `
      attribute vec3 aPos;
      uniform mat4 uProj;
      uniform mat4 uView;
      uniform float uTime;
      varying float vAlpha;
      void main() {
        vec3 pos = aPos;
        pos.y += sin(uTime * 0.3 + pos.x * 0.5) * 0.3;
        pos.x += cos(uTime * 0.2 + pos.z * 0.3) * 0.2;
        vec4 mvPos = uView * vec4(pos, 1.0);
        gl_Position = uProj * mvPos;
        float dist = length(mvPos.xyz);
        vAlpha = smoothstep(25.0, 8.0, dist) * 0.12;
      }
    `;

    const lineFS = `
      precision mediump float;
      varying float vAlpha;
      void main() {
        gl_FragColor = vec4(0.79, 0.63, 0.86, vAlpha);
      }
    `;

    function compileShader(src, type) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    }

    function createProgram(vs, fs) {
      const p = gl.createProgram();
      gl.attachShader(p, compileShader(vs, gl.VERTEX_SHADER));
      gl.attachShader(p, compileShader(fs, gl.FRAGMENT_SHADER));
      gl.linkProgram(p);
      return p;
    }

    const pointProg = createProgram(vsSource, fsSource);
    const lineProg = createProgram(lineVS, lineFS);

    // Generate particles
    const NUM = 400;
    const positions = new Float32Array(NUM * 3);
    const sizes = new Float32Array(NUM);
    const colors = new Float32Array(NUM * 3);

    const palette = [
      [0.79, 0.63, 0.86],
      [0.49, 0.72, 0.85],
      [0.95, 0.77, 0.49],
      [0.55, 0.91, 0.63],
      [0.9, 0.88, 0.94]
    ];

    for (let i = 0; i < NUM; i++) {
      positions[i*3]   = (Math.random() - 0.5) * 30;
      positions[i*3+1] = (Math.random() - 0.5) * 30;
      positions[i*3+2] = (Math.random() - 0.5) * 30;
      sizes[i] = Math.random() * 3 + 1;
      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i*3] = c[0]; colors[i*3+1] = c[1]; colors[i*3+2] = c[2];
    }

    // Generate connection lines
    const CONN_DIST = 4.5;
    const lineVerts = [];
    for (let i = 0; i < NUM; i++) {
      for (let j = i+1; j < NUM; j++) {
        const dx = positions[i*3] - positions[j*3];
        const dy = positions[i*3+1] - positions[j*3+1];
        const dz = positions[i*3+2] - positions[j*3+2];
        if (dx*dx + dy*dy + dz*dz < CONN_DIST * CONN_DIST) {
          lineVerts.push(
            positions[i*3], positions[i*3+1], positions[i*3+2],
            positions[j*3], positions[j*3+1], positions[j*3+2]
          );
        }
      }
    }
    const lineData = new Float32Array(lineVerts);

    // Buffers
    function createBuffer(data) {
      const b = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, b);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return b;
    }

    const posBuf = createBuffer(positions);
    const sizeBuf = createBuffer(sizes);
    const colBuf = createBuffer(colors);
    const lineBuf = createBuffer(lineData);

    // Matrix utils
    function perspective(fov, aspect, near, far) {
      const f = 1 / Math.tan(fov/2);
      const nf = 1 / (near - far);
      return new Float32Array([
        f/aspect,0,0,0,
        0,f,0,0,
        0,0,(far+near)*nf,-1,
        0,0,2*far*near*nf,0
      ]);
    }

    function lookAt(eye, center, up) {
      const zx=eye[0]-center[0], zy=eye[1]-center[1], zz=eye[2]-center[2];
      let len = 1/Math.sqrt(zx*zx+zy*zy+zz*zz);
      const z0=zx*len, z1=zy*len, z2=zz*len;
      const xx=up[1]*z2-up[2]*z1, xy=up[2]*z0-up[0]*z2, xz=up[0]*z1-up[1]*z0;
      len=1/Math.sqrt(xx*xx+xy*xy+xz*xz);
      const x0=xx*len, x1=xy*len, x2=xz*len;
      const y0=z1*x2-z2*x1, y1=z2*x0-z0*x2, y2=z0*x1-z1*x0;
      return new Float32Array([
        x0,y0,z0,0,
        x1,y1,z1,0,
        x2,y2,z2,0,
        -(x0*eye[0]+x1*eye[1]+x2*eye[2]),
        -(y0*eye[0]+y1*eye[1]+y2*eye[2]),
        -(z0*eye[0]+z1*eye[1]+z2*eye[2]),1
      ]);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let mouseX = 0, mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      if (cursorGlowRef.current) {
        cursorGlowRef.current.style.left = e.clientX + 'px';
        cursorGlowRef.current.style.top = e.clientY + 'px';
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    let scrollY = 0;
    const handleScroll = () => {
      scrollY = window.pageYOffset;
    };
    window.addEventListener('scroll', handleScroll);

    let animationId;
    function render(t) {
      t *= 0.001;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const aspect = canvas.width / canvas.height;
      const proj = perspective(Math.PI/3, aspect, 0.1, 100);

      const camY = -scrollY * 0.003;
      const camX = mouseX * 1.5;
      const camYm = mouseY * 1 + camY;
      const view = lookAt([camX, camYm, 12], [0, camY, 0], [0, 1, 0]);

      // Draw lines
      gl.useProgram(lineProg);
      const lPosLoc = gl.getAttribLocation(lineProg, 'aPos');
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      gl.enableVertexAttribArray(lPosLoc);
      gl.vertexAttribPointer(lPosLoc, 3, gl.FLOAT, false, 0, 0);
      gl.uniformMatrix4fv(gl.getUniformLocation(lineProg, 'uProj'), false, proj);
      gl.uniformMatrix4fv(gl.getUniformLocation(lineProg, 'uView'), false, view);
      gl.uniform1f(gl.getUniformLocation(lineProg, 'uTime'), t);
      gl.drawArrays(gl.LINES, 0, lineData.length / 3);

      // Draw points
      gl.useProgram(pointProg);
      const pPosLoc = gl.getAttribLocation(pointProg, 'aPos');
      const pSizeLoc = gl.getAttribLocation(pointProg, 'aSize');
      const pColLoc = gl.getAttribLocation(pointProg, 'aColor');

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
      gl.enableVertexAttribArray(pPosLoc);
      gl.vertexAttribPointer(pPosLoc, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
      gl.enableVertexAttribArray(pSizeLoc);
      gl.vertexAttribPointer(pSizeLoc, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, colBuf);
      gl.enableVertexAttribArray(pColLoc);
      gl.vertexAttribPointer(pColLoc, 3, gl.FLOAT, false, 0, 0);

      gl.uniformMatrix4fv(gl.getUniformLocation(pointProg, 'uProj'), false, proj);
      gl.uniformMatrix4fv(gl.getUniformLocation(pointProg, 'uView'), false, view);
      gl.uniform1f(gl.getUniformLocation(pointProg, 'uTime'), t);
      gl.drawArrays(gl.POINTS, 0, NUM);

      animationId = requestAnimationFrame(render);
    }
    animationId = requestAnimationFrame(render);

    // Scroll reveal observer
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });
    reveals.forEach(el => observer.observe(el));

    // Nav active state
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    const navObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + id);
          });
        }
      });
    }, { threshold: 0.4 });
    sections.forEach(s => navObserver.observe(s));

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationId);
      observer.disconnect();
      navObserver.disconnect();
    };
  }, []);

  return (
    <div className="App">
      <canvas id="bg-canvas" ref={canvasRef}></canvas>
      <div className="cursor-glow" ref={cursorGlowRef}></div>

      <nav id="mainNav">
        <a href="#hero"><span className="nav-label">Home</span></a>
        <a href="#about"><span className="nav-label">About</span></a>
        <a href="#skills"><span className="nav-label">Skills</span></a>
        <a href="#projects"><span className="nav-label">Projects</span></a>
        <a href="#education"><span className="nav-label">Education</span></a>
        <a href="#certifications"><span className="nav-label">Certs</span></a>
        <a href="#contact"><span className="nav-label">Contact</span></a>
      </nav>

      <div className="content-wrapper">
        {/* HERO */}
        <section className="hero" id="hero">
          <div className="hero-tag">Graphic Designer · IT Student</div>
          <h1>Priyanka<br /><span className="highlight">Saha</span></h1>
          <p className="hero-sub">Blending technology with visual storytelling — crafting brands, layouts, and digital experiences that communicate with clarity and impact.</p>
          <div className="hero-contact">
            <span>📍 Malda, West Bengal</span>
            <a href="mailto:priyanka.riya2003@gmail.com">✉ priyanka.riya2003@gmail.com</a>
            <a href="tel:+918597049809">📞 +91-8597049809</a>
          </div>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="scroll-line"></div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about">
          <div className="about-grid reveal">
            <div className="about-text">
              <div className="section-header">
                <h2>About Me</h2>
                <div className="line"></div>
              </div>
              <p>B.Tech Information Technology student transitioning into graphic design with a strong interest in visual communication and branding.</p>
              <p>Currently building skills in design fundamentals such as typography, color theory, and layout composition. Familiar with industry tools including Adobe Photoshop, Adobe Illustrator, and Figma, and actively working on developing a portfolio of creative projects.</p>
            </div>
            <div className="info-grid">
              <div className="info-item">
                <div className="label">Name</div>
                <div className="value">Priyanka Saha</div>
              </div>
              <div className="info-item">
                <div className="label">Location</div>
                <div className="value">Malda, WB</div>
              </div>
              <div className="info-item">
                <div className="label">Degree</div>
                <div className="value">B.Tech IT</div>
              </div>
              <div className="info-item">
                <div className="label">Graduating</div>
                <div className="value">2026</div>
              </div>
              <div className="info-item">
                <div className="label">Focus</div>
                <div className="value">Graphic Design</div>
              </div>
              <div className="info-item">
                <div className="label">Status</div>
                <div className="value">Open to Work</div>
              </div>
            </div>
          </div>
        </section>

        {/* SKILLS */}
        <section className="skills-section" id="skills">
          <div className="skills-container">
            <div className="section-header reveal">
              <h2>Skills & Tools</h2>
              <div className="line"></div>
            </div>
            <div className="skills-categories reveal">
              <div className="skill-card">
                <h3>Design Fundamentals</h3>
                <div className="skill-tags">
                  <span className="skill-tag">Typography</span>
                  <span className="skill-tag">Color Theory</span>
                  <span className="skill-tag">Layout & Composition</span>
                  <span className="skill-tag">Visual Hierarchy</span>
                  <span className="skill-tag">Basic Branding</span>
                </div>
              </div>
              <div className="skill-card">
                <h3>Design Tools</h3>
                <div className="skill-tags">
                  <span className="skill-tag">Adobe Photoshop</span>
                  <span className="skill-tag">Adobe Illustrator</span>
                  <span className="skill-tag">Figma</span>
                </div>
              </div>
              <div className="skill-card">
                <h3>Technical</h3>
                <div className="skill-tags">
                  <span className="skill-tag">C</span>
                  <span className="skill-tag">C++</span>
                  <span className="skill-tag">Java</span>
                  <span className="skill-tag">SQL</span>
                  <span className="skill-tag">HTML</span>
                  <span className="skill-tag">CSS</span>
                </div>
              </div>
              <div className="skill-card">
                <h3>Soft Skills</h3>
                <div className="skill-tags">
                  <span className="skill-tag">Communication</span>
                  <span className="skill-tag">Adaptability</span>
                  <span className="skill-tag">Time Management</span>
                  <span className="skill-tag">Attention to Detail</span>
                  <span className="skill-tag">Willingness to Learn</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="projects-section" id="projects">
          <div className="projects-container">
            <div className="section-header reveal">
              <h2>Projects</h2>
              <div className="line"></div>
            </div>
            <div className="project-card reveal">
              <div className="project-num">PROJECT 01</div>
              <h3>AI-Driven Genome Disorder Prediction System with XAI</h3>
              <ul>
                <li>Developed a machine learning pipeline to classify genome patterns for disorder prediction</li>
                <li>Applied explainable AI techniques (LIME, SHAP) to improve transparency and interpretability</li>
                <li>Focused on reliability and understanding of model decisions through feature importance analysis</li>
              </ul>
              <div className="project-tags">
                <span>Machine Learning</span>
                <span>XAI</span>
                <span>LIME</span>
                <span>SHAP</span>
                <span>Genomics</span>
              </div>
            </div>
            <div className="project-card reveal">
              <div className="project-num">PROJECT 02</div>
              <h3>Design Portfolio (In Progress)</h3>
              <ul>
                <li>Actively creating projects including branding concepts, social media creatives, and poster designs</li>
                <li>Practicing layout design, typography, and color combinations to improve visual communication skills</li>
              </ul>
              <div className="project-tags">
                <span>Branding</span>
                <span>Social Media</span>
                <span>Poster Design</span>
                <span>Typography</span>
              </div>
            </div>
          </div>
        </section>

        {/* EDUCATION */}
        <section className="education-section" id="education">
          <div className="education-container">
            <div className="section-header reveal">
              <h2>Education</h2>
              <div className="line"></div>
            </div>
            <div className="timeline reveal">
              <div className="timeline-item">
                <h3>B.Tech in Information Technology</h3>
                <div className="institution">Techno Main Salt Lake</div>
                <div className="year">2022 — 2026</div>
              </div>
              <div className="timeline-item">
                <h3>Higher Secondary</h3>
                <div className="institution">Board Examination</div>
                <div className="year">Completed</div>
                <div className="scores">
                  <div className="score-badge">Score: <strong>83%</strong></div>
                </div>
              </div>
              <div className="timeline-item">
                <h3>Secondary</h3>
                <div className="institution">Board Examination</div>
                <div className="year">Completed</div>
                <div className="scores">
                  <div className="score-badge">Score: <strong>75.29%</strong></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section id="certifications">
          <div className="reveal" style={{width: '100%', maxWidth: '900px'}}>
            <div className="section-header">
              <h2>Certifications</h2>
              <div className="line"></div>
            </div>
            <div className="cert-card" style={{marginTop: '24px'}}>
              <div className="cert-badge">VERIFIED</div>
              <h3>Data Analytics Job Simulation</h3>
              <div className="cert-org">Deloitte Australia — via Forage</div>
              <div className="cert-date">June 2025</div>
              <ul>
                <li>Completed practical tasks involving data cleaning, dashboard creation, and analytical insights</li>
                <li>Analyzed client telemetry data to identify patterns and trends</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="contact-section" id="contact">
          <div className="reveal">
            <h2>Let's Connect</h2>
            <p>Open to graphic design internships, freelance opportunities, and creative collaborations.</p>
            <div className="contact-links" style={{marginTop: '16px'}}>
              <a href="mailto:priyanka.riya2003@gmail.com" className="contact-link">
                <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
                priyanka.riya2003@gmail.com
              </a>
              <a href="tel:+918597049809" className="contact-link">
                <svg viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
                +91-8597049809
              </a>
            </div>
          </div>
        </section>

        <footer>
          © 2026 Priyanka Saha — Designed with ✦ purpose
        </footer>
      </div>
    </div>
  );
}

export default App;
