import { Link } from "react-router-dom";

function ResortCard({ resort }) {
  const openSlopes = resort.slopes.filter(
    (slope) => slope.status === "open",
  ).length;
  const openLifts = resort.lifts.filter(
    (lift) => lift.status === "open",
  ).length;

  return (
    <div className="resort-card">
      <img className="resort-image" src={resort.image} alt={resort.name} />

      <div className="resort-card-content">
        <h2>{resort.name}</h2>

        <p className="resort-location">
          {resort.city}, {resort.country}
        </p>

        <div className="resort-stats">
          <span>{resort.condition.snowDepthCm} cm snow</span>
          <span>
            {openSlopes}/{resort.slopes.length} slopes
          </span>
          <span>
            {openLifts}/{resort.lifts.length} lifts
          </span>
        </div>

        <div className="resort-meta">
          <p>{resort.difficultyLevel}</p>
          <p>⭐ {resort.reviews.averageRating}</p>
        </div>

        <Link className="details-btn" to={`/resorts/${resort.id}`}>
          View Details
        </Link>
      </div>
    </div>
  );
}

export default ResortCard;
