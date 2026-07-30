import Button from "./Button";
import heroImage from "../assets/images/hero.png";
import "./Hero.css";

function Hero() {
  return (
    <section className="hero">
      <img
        src={heroImage}
        alt="LumiStrip"
        className="hero-image"
      />

      <p className="tagline">
        Every memory deserves to shine.
      </p>

      <p className="description">
        Don't wait for the special moment to come, Make every moment special with LumiStrip.
      </p>

      <Button text="Start Session" />
    </section>
  );
}

export default Hero;