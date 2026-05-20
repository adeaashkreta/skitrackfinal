import "../styles/Resorts.css";
import { useState } from "react";
import Navbar from "../components/Navbar";
import ResortCard from "../components/ResortCard";
import { resorts } from "../data/resorts";
import "../styles/Resorts.css";

function Resorts() {
  const [search, setSearch] = useState("");

  const filteredResorts = resorts.filter((resort) => {
    return (
      resort.name.toLowerCase().includes(search.toLowerCase()) ||
      resort.country.toLowerCase().includes(search.toLowerCase()) ||
      resort.city.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <>
      <Navbar />

      <section className="resorts-page">
        <div className="container">
          <div className="resorts-header">
            <h1>Ski Resorts</h1>
            <p>Browse ski resorts and check basic conditions.</p>

            <input
              className="resort-search"
              type="text"
              placeholder="Search by resort, country or city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="resorts-grid">
            {filteredResorts.map((resort) => (
              <ResortCard key={resort.id} resort={resort} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Resorts;
