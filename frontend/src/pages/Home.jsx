import Navbar from "../components/Navbar";
import "../styles/Home.css";

function Home() {
  return (
    <>
      <Navbar />

      <section className="home-page">
        <div className="container home-content">
          <h1>Welcome to SkiTrack</h1>
          <p>
            Explore ski resorts, check live conditions, save favorites and plan
            your winter experience.
          </p>
        </div>
      </section>
    </>
  );
}

export default Home;
