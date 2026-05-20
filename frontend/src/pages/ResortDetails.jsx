import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { resorts } from "../data/resorts";
import "../styles/ResortDetails.css";

function ResortDetails() {
  const { id } = useParams();
  const resort = resorts.find((item) => item.id === Number(id));

  if (!resort) {
    return (
      <>
        <Navbar />
        <section className="details-page">
          <div className="container">
            <h1>Resort not found</h1>
            <Link className="back-link" to="/resorts">
              Back to resorts
            </Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="details-page">
        <div className="container">
          <Link className="back-link" to="/resorts">
            ← Back to Resorts
          </Link>

          <div className="details-card">
            <h1>{resort.name}</h1>

            <p className="details-location">
              {resort.city}, {resort.country}
            </p>

            <p className="details-description">{resort.description}</p>

            <div className="details-grid">
              <div>
                <strong>Difficulty</strong>
                <span>{resort.difficulty}</span>
              </div>

              <div>
                <strong>Snow Depth</strong>
                <span>{resort.snowDepth} cm</span>
              </div>

              <div>
                <strong>Open Slopes</strong>
                <span>{resort.slopesOpen}</span>
              </div>

              <div>
                <strong>Open Lifts</strong>
                <span>{resort.liftsOpen}</span>
              </div>

              <div>
                <strong>Price</strong>
                <span>€{resort.price}</span>
              </div>

              <div>
                <strong>Rating</strong>
                <span>⭐ {resort.rating}</span>
              </div>
            </div>

            <div className="details-actions">
              <button>Add to Favorites</button>
              <button>Book Now</button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default ResortDetails;
