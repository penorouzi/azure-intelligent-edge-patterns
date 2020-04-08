import React from 'react';
import { Switch, Route } from 'react-router-dom';
import Cameras from '../pages/Cameras';
import CameraDetails from '../pages/CameraDetails';
import { Parts } from '../pages/Parts';
import LabelingPage from '../pages/LabelingPage';
import Locations from '../pages/Locations';
import LocationRegister from '../pages/LocationRegister';

export const RootRouter: React.FC = () => {
  return (
    <Switch>
      <Route path="/location/register" component={LocationRegister} />
      <Route path="/location" component={Locations} />
      <Route path="/label" component={LabelingPage} />
      <Route path="/cameras/:name" component={CameraDetails} />
      <Route path="/cameras" component={Cameras} />
      <Route path="/parts" component={Parts} />
      <Route path="/" component={null} />
    </Switch>
  );
};
