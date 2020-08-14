import React, { useState, useEffect } from 'react';
import * as R from 'ramda';
import uniqid from 'uniqid';
import { Text, Checkbox, Flex, Provider } from '@fluentui/react-northstar';
import { useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';

import { nanoid } from '@reduxjs/toolkit';
import { State } from 'RootStateType';
import { Button } from '../Button';
import { LiveViewScene } from './LiveViewScene';
import useImage from '../LabelingPage/util/useImage';
import { CreatingState } from './LiveViewContainer.type';
import { errorTheme } from '../../themes/errorTheme';
import { WarningDialog } from '../WarningDialog';
import { useInterval } from '../../hooks/useInterval';
import { selectCameraById } from '../../store/cameraSlice';
import {
  selectAOIsByCamera,
  updateAOI,
  createAOI,
  removeAOI,
  createDefaultAOI,
  selectOriginAOIsByCamera,
} from '../../store/AOISlice';
import { toggleShowAOI, updateCameraArea } from '../../store/actions';

export const LiveViewContainer: React.FC<{
  showVideo: boolean;
  cameraId: number;
  onDeleteProject: () => void;
}> = ({ showVideo, cameraId, onDeleteProject }) => {
  const showAOI = useSelector<State, boolean>((state) => selectCameraById(state, cameraId).useAOI);
  const AOIs = useSelector(selectAOIsByCamera(cameraId));
  const originAOIs = useSelector(selectOriginAOIsByCamera(cameraId));
  const [showUpdateSuccessTxt, setShowUpdateSuccessTxt] = useState(false);
  const [loading, setLoading] = useState(false);
  const imageInfo = useImage('/api/inference/video_feed', '', true, true);
  const [creatingAOI, setCreatingAOI] = useState(CreatingState.Disabled);
  const dispatch = useDispatch();

  const onCheckboxClick = async (): Promise<void> => {
    setLoading(true);
    try {
      await dispatch(toggleShowAOI({ cameraId, showAOI: !showAOI }));
      setShowUpdateSuccessTxt(true);
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

  const onUpdate = async (): Promise<void> => {
    setLoading(true);
    try {
      await dispatch(updateCameraArea(cameraId));
      setShowUpdateSuccessTxt(true);
    } catch (e) {
      alert(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showUpdateSuccessTxt) {
      const timer = setTimeout(() => {
        setShowUpdateSuccessTxt(false);
      }, 3000);
      return (): void => clearTimeout(timer);
    }
  }, [showUpdateSuccessTxt]);

  // Extract the width and height to make the dependency array clearer.
  const { width: imgWidth, height: imgHeight } = imageInfo[2];
  useEffect(() => {
    if (imgWidth !== 0 && imgHeight !== 0 && AOIs.length === 0)
      dispatch(
        createDefaultAOI({
          id: uniqid(),
          x1: imgWidth * 0.1,
          y1: imgHeight * 0.1,
          x2: imgWidth * 0.9,
          y2: imgHeight * 0.9,
          camera: cameraId,
        }),
      );
  }, [cameraId, dispatch, imgHeight, imgWidth, AOIs]);

  useInterval(() => {
    Axios.get('/api/inference/video_feed/keep_alive').catch(console.error);
  }, 3000);

  const hasEdit = !R.equals(originAOIs, AOIs);
  const updateBtnDisabled = !showAOI || !hasEdit;

  return (
    <Flex column gap="gap.medium" styles={{ height: '100%' }}>
      <Flex gap="gap.small">
        {/* {error && <Alert danger header="Failed to Update!" content={`${error.name}: ${error.message}`} />} */}
        <Checkbox
          labelPosition="start"
          label="Enable area of interest"
          toggle
          checked={showAOI}
          onClick={onCheckboxClick}
        />
        <Button
          content="Create AOI"
          primary={creatingAOI !== CreatingState.Disabled}
          disabled={!showAOI}
          onClick={(): void => {
            if (creatingAOI === CreatingState.Disabled) setCreatingAOI(CreatingState.Waiting);
            else setCreatingAOI(CreatingState.Disabled);
          }}
          circular
          styles={{ padding: '0 5px' }}
        />
        <Button
          content="Update"
          primary
          disabled={updateBtnDisabled}
          onClick={onUpdate}
          loading={loading}
          circular
        />
        <Text styles={{ visibility: showUpdateSuccessTxt ? 'visible' : 'hidden' }}>Updated!</Text>
        <Provider theme={errorTheme}>
          <WarningDialog
            contentText={<p>Sure you want to delete the configuration?</p>}
            trigger={
              <Button content="Delete Configuration" primary circular styles={{ marginRight: 'auto' }} />
            }
            onConfirm={onDeleteProject}
          />
        </Provider>
      </Flex>
      <div style={{ width: '100%', height: '100%', backgroundColor: 'black' }}>
        {showVideo ? (
          <LiveViewScene
            AOIs={AOIs}
            createAOI={(point) => dispatch(createAOI({ id: nanoid(), point, cameraId }))}
            updateAOI={(id, changes) => dispatch(updateAOI({ id, changes }))}
            removeAOI={(AOIId) => dispatch(removeAOI(AOIId))}
            visible={showAOI}
            imageInfo={imageInfo}
            creatingState={creatingAOI}
            setCreatingState={setCreatingAOI}
          />
        ) : null}
      </div>
    </Flex>
  );
};
