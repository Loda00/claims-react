import React, { Fragment } from 'react';

const Info = ({ valor }) => (
  <Fragment>
    <div className="show-name-core">
      En Acsel/X:
      <span className="show-info-core">{valor}</span>
    </div>
  </Fragment>
);

export default Info;
