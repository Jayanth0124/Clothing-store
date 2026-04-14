import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";

export default function NotFound() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const tl = gsap.timeline();

    tl.fromTo(
      ".split-404 span",
      {
        y: 120,
        opacity: 0,
        rotateX: 90,
      },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 1.2,
        stagger: 0.12,
        ease: "power4.out",
      }
    )
      .fromTo(
        ".tear-line",
        {
          scaleX: 0,
          opacity: 0,
        },
        {
          scaleX: 1,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
        },
        "-=0.8"
      )
      .fromTo(
        ".nf-content",
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
        },
        "-=0.8"
      );

    gsap.to(".split-shadow", {
      x: 8,
      y: 6,
      repeat: -1,
      yoyo: true,
      duration: 4,
      ease: "sine.inOut",
    });
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    gsap.to(".split-main", {
      x: x * 18,
      y: y * 12,
      duration: 0.8,
      ease: "power3.out",
    });

    gsap.to(".split-shadow", {
      x: x * -22,
      y: y * -16,
      duration: 1,
      ease: "power3.out",
    });

    gsap.to(".tear-line", {
      skewX: x * 6,
      duration: 0.8,
    });
  };

  return (
    <main
      ref={wrapperRef}
      onMouseMove={handleMouseMove}
      style={{
        minHeight: "100vh",
        background: "#0A0A0A",
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "120px 20px 60px",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Grain Texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.035,
          pointerEvents: "none",
          backgroundImage:
            "url('https://grainy-gradients.vercel.app/noise.svg')",
        }}
      />

      <div
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {/* Split Typography */}
        <div
          className="split-404"
          style={{
            position: "relative",
            display: "inline-block",
            marginBottom: "2rem",
            perspective: "1000px",
          }}
        >
          <div
            className="split-shadow"
            style={{
              position: "absolute",
              inset: 0,
              color: "#D4AF37",
              opacity: 0.15,
              transform: "translate(10px,8px)",
              fontFamily: "Suissnord",
              fontSize: "clamp(7rem, 20vw, 16rem)",
              lineHeight: 1,
              letterSpacing: "-8px",
            }}
          >
            404
          </div>

          <div
            className="split-main"
            style={{
              position: "relative",
              fontFamily: "Suissnord",
              fontSize: "clamp(7rem, 20vw, 16rem)",
              lineHeight: 1,
              color: "#fff",
              letterSpacing: "-8px",
            }}
          >
            <span>4</span>
            <span>0</span>
            <span>4</span>
          </div>
        </div>

        {/* Tear Line */}
        <div
          className="tear-line"
          style={{
            width: "70%",
            maxWidth: "700px",
            height: "2px",
            margin: "0 auto 2rem",
            background:
              "linear-gradient(90deg, transparent, #D4AF37, transparent)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-6px 0",
              background:
                "repeating-linear-gradient(90deg, transparent 0 8px, rgba(212,175,55,0.4) 8px 10px)",
              opacity: 0.35,
            }}
          />
        </div>

        {/* Content */}
        <h2
          className="nf-content"
          style={{
            fontSize: "1rem",
            letterSpacing: "6px",
            textTransform: "uppercase",
            color: "#D4AF37",
            marginBottom: "1.5rem",
            fontFamily: "Manrope",
          }}
        >
          Thread Lost
        </h2>

        <p
          className="nf-content"
          style={{
            maxWidth: "650px",
            margin: "0 auto 3rem",
            color: "#888",
            fontSize: "1rem",
            lineHeight: 1.9,
          }}
        >
          The silhouette you seek has unraveled beyond the seams of our
          collection. It may have been archived, removed, or never stitched into
          existence.
        </p>

        <Link
          to="/"
          className="nf-content"
          style={{
            display: "inline-block",
            padding: "1rem 3rem",
            border: "1px solid rgba(255,255,255,0.25)",
            color: "#fff",
            textDecoration: "none",
            textTransform: "uppercase",
            letterSpacing: "2px",
            fontSize: "0.8rem",
            transition: "all 0.35s ease",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.borderColor = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#fff";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
          }}
        >
          Return To Home
        </Link>
      </div>
    </main>
  );
}