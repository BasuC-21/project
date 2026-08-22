import {
  Github,
  Linkedin,
  Globe,
  Code2,
  ExternalLink,
} from "lucide-react";

function DeveloperSection() {
  return (
    <section className="developer-section">
      <div className="developer-glow"></div>

      <div className="developer-content">
        <span className="developer-label">
          <Code2 size={14} />
          THE MIND BEHIND EDUTUBE
        </span>

        <h2>
          Built with curiosity.
          <span> Created with purpose.</span>
        </h2>

        <p>
          EduTube is a full-stack learning platform designed
          to make educational content easier to discover,
          watch, and learn from.
        </p>

        <div className="developer-tech">
          <span>React</span>
          <span>Node.js</span>
          <span>Express</span>
          <span>MongoDB</span>
          <span>Cloudinary</span>
          <span>JWT</span>
        </div>

        <div className="developer-profile">
          <div className="developer-avatar">
            YN
          </div>

          <div className="developer-info">
            <strong>YOUR NAME</strong>
            <span>Full Stack Developer</span>
          </div>
        </div>

        <div className="developer-links">
          <a
            href="#"
            className="developer-link"
          >
            <Github size={17} />
            GitHub
            <ExternalLink size={13} />
          </a>

          <a
            href="#"
            className="developer-link"
          >
            <Linkedin size={17} />
            LinkedIn
            <ExternalLink size={13} />
          </a>

          <a
            href="#"
            className="developer-link"
          >
            <Globe size={17} />
            Portfolio
            <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default DeveloperSection;