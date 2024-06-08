import React from "react";
import { Helmet } from "react-helmet";

const MetaData = ({ title }) => {
  return (
    <Helmet>
      <title>{`${title} - A E G C O`}</title>
    </Helmet>
  );
};

export default MetaData;