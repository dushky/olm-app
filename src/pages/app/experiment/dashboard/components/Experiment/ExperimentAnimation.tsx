// @ts-nocheck
import React, {useContext, useEffect, useState} from 'react'
import {
  Vector3,
  HemisphericLight,
  Color3,
  ArcRotateCamera,
  Tools,
  SceneLoader,
  StandardMaterial,
} from '@babylonjs/core'
import '@babylonjs/loaders'
import { useTranslation } from 'react-i18next'
import { CButton } from '@coreui/react'

import { SceneComponent } from './SceneComponent'
import { WsData } from 'types'
import {SpinnerOverlay} from "../../../../../../components";
import {DashboardContext} from "./ExperimentDashboardWrapper";

// type Props = {
//   data?: WsData[],
//   running: boolean,
//   loading: boolean
// }

type Props = {}

const onSceneReady = (scene: any) => {
  scene.getEngine().enableOfflineSupport = false;

  scene.clearColor = Color3.White();

  const camera = new ArcRotateCamera("arcCamera", Tools.ToRadians(45), Tools.ToRadians(45), 10.0, Vector3.Zero(), scene);

  const canvas = scene.getEngine().getRenderingCanvas()
  camera.attachControl(canvas, true);

  const lightHT = new HemisphericLight("light1", new Vector3(0, 2, 0), scene);
  const lightHB = new HemisphericLight("light1", new Vector3(0, -1, 0), scene);

  lightHT.intensity = 0.75;
  lightHB.intensity = 0.4;

  SceneLoader.Append("/model/", "tos_new.glb", scene, function (scene) {
    const materialBlack = new StandardMaterial('materialBlack', scene);
    materialBlack.diffuseColor = new Color3(0.25, 0.25, 0.25);

    const materialGrey = new StandardMaterial('materialGrey', scene);
    materialGrey.diffuseColor = new Color3(0.9, 0.9, 0.9);

    const materialGreyFanCover = new StandardMaterial('materialGreyFanCover', scene);
    materialGreyFanCover.diffuseColor = new Color3(0.9, 0.9, 0.9);

    const materialBulb = new StandardMaterial('materialBulb', scene);
    materialBulb.diffuseColor = new Color3(0, 0, 0);

    const materialLed = new StandardMaterial('materialLed', scene);
    materialLed.diffuseColor = new Color3(1, 1, 1);

    if (scene.getMeshByID("case1")) scene.getMeshByID("case1").material = materialGrey;
    if (scene.getMeshByID("case2")) scene.getMeshByID("case2").material = materialGrey;
    if (scene.getMeshByID("Cube.001")) scene.getMeshByID("Cube.001").material = materialGrey;

    if (scene.getMeshByID("fan_cover1")) scene.getMeshByID("fan_cover1").material = materialGreyFanCover; //open case

    if (scene.getMeshByID("front_top_black")) scene.getMeshByID("front_top_black").material = materialBlack;
    if (scene.getMeshByID("front_bottom_black")) scene.getMeshByID("front_bottom_black").material = materialBlack;
    if (scene.getMeshByID("back_black")) scene.getMeshByID("back_black").material = materialBlack;
    if (scene.getMeshByID("fan")) scene.getMeshByID("fan").material = materialBlack;

    if (scene.getMeshByID("fan")) scene.getMeshByID("fan").rotation = new Vector3(0, 0, 0);

    if (scene.getMeshByID("inside_yellow_bulb_bottom")) scene.getMeshByID("inside_yellow_bulb_bottom").material = materialBulb;
    if (scene.getMeshByID("inside_led_yellow")) scene.getMeshByID("inside_led_yellow").material = materialLed;
  })
}

const onRender = (scene: any) => {
  if (window.range <= 0) {
    if (scene.getMeshByID("fan")) scene.getMeshByID("fan").rotation.y = 0
  } else {
    if (scene.getMeshByID("fan")) scene.getMeshByID("fan").rotation.y += ((window.range / 360) * (Math.PI / 180))
  }

  if (window.ledIntensity != null && scene.getMeshByID("fan")) {
    scene.getMeshByID("inside_yellow_bulb_bottom").material.diffuseColor = new Color3(window.ledIntensity / 100, window.ledIntensity / 100, 0);
  }

  if (window.bulbIntensity != null && scene.getMeshByID("inside_led_yellow")) {
    scene.getMeshByID("inside_led_yellow").material.diffuseColor = new Color3(window.bulbIntensity / 100, window.bulbIntensity / 100, 0);
  }

  if (!window.cover) {
    if (scene.getMeshByID("fan_cover1") && scene.getMeshByID("fan_cover1").material.alpha > 0) {
      scene.getMeshByID("fan_cover1").material.alpha -= 0.03;
    }
  } else {
    if (scene.getMeshByID("fan_cover1") && scene.getMeshByID("fan_cover1").material.alpha <= 1) {
      scene.getMeshByID("fan_cover1").material.alpha += 0.05;
    }
  }
}

const getParamValue = (data: WsData[], name: string) => {
  let param = data ? data.find(p => p.name === name) : null
  return param ? parseFloat(param.data[param.data.length - 1]) : 0
}

// const ExperimentAnimation: React.FC<Props> = ({ data, running, loading }: Props) => {
const ExperimentAnimation: React.FC<Props> = () => {
  const {
    loading,
    data,
      running
  } = useContext(DashboardContext)
  const { t } = useTranslation()
  const [cover, setCover] = useState(true)

  useEffect(() => {
    window.cover = true
  }, [])

  useEffect(() => {
    if (!running || !data) {
      window.range = 0
      window.ledIntensity = 0
      window.bulbIntensity = 0
    } else {
      window.range = getParamValue(data, 'Fan filtered rpm') // 13 // 14
      window.ledIntensity = getParamValue(data, 'LED control signal') // 17 // 19
      window.bulbIntensity = getParamValue(data, 'Lamp control signal') // 16 // 18
    }
  }, [data, running])

  return (
      <div className="d-flex flex-column justify-content-center h-100 position-relative pb-2">
        {loading && <SpinnerOverlay transparent={true} className="position-absolute" style={{ zIndex: 999 }} />}
        <SceneComponent
            antialias
            onSceneReady={onSceneReady}
            onRender={onRender}
            id="canvas"
        />

        <CButton
            onClick={() => {
              setCover(!cover)
              window.cover = !window.cover
            }}
        >
          {cover ? t('experiments.remove_cover') : t('experiments.add_cover')}
        </CButton>
      </div>
  )
}

export default React.memo(ExperimentAnimation)
