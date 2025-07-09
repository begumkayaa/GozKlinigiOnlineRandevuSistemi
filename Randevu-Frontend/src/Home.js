import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div>
      <h1>Ana Sayfa</h1>
      <Link to="/about">
        <button>Hakkında Sayfasına Git</button>
      </Link>
    </div>
  );
};

export default Home;
