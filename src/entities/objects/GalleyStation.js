/**
 * GalleyStation.js - Food preparation and eating area
 */

import * as THREE from 'three';
import HabitatObject from '../HabitatObject.js';

class GalleyStation extends HabitatObject {
  constructor(objectId, tileX, tileY, moduleId) {
    super('galley_station', objectId, tileX, tileY, moduleId);

    this.useDuration = 20.0;  // 20 minutes eating
    this.needSatisfaction = {
      hunger: -60,             // Greatly reduces hunger
      mood: 5,                 // Slightly improves mood
      socialNeed: -10          // Social eating reduces social need
    };
  }

  createVisual() {
    const group = new THREE.Group();

    // Counter
    const counterGeo = new THREE.BoxGeometry(1.0, 0.05, 0.6);
    const counterMat = new THREE.MeshStandardMaterial({
      color: 0xdcdcdc,
      metalness: 0.2,
      roughness: 0.6
    });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.y = 0.5;
    group.add(counter);

    // Cabinet base
    const cabinetGeo = new THREE.BoxGeometry(0.9, 0.5, 0.55);
    const cabinetMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
    cabinet.position.y = 0.25;
    group.add(cabinet);

    // Microwave/oven
    const ovenGeo = new THREE.BoxGeometry(0.4, 0.3, 0.4);
    const ovenMat = new THREE.MeshStandardMaterial({
      color: 0x2c3e50,
      metalness: 0.5
    });
    const oven = new THREE.Mesh(ovenGeo, ovenMat);
    oven.position.set(-0.25, 0.675, 0);
    group.add(oven);

    // Food storage
    const storageGeo = new THREE.BoxGeometry(0.3, 0.25, 0.3);
    const storageMat = new THREE.MeshStandardMaterial({ color: 0x3498db });
    const storage = new THREE.Mesh(storageGeo, storageMat);
    storage.position.set(0.3, 0.65, 0);
    group.add(storage);

    // Sink
    const sinkGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.08, 16);
    const sinkMat = new THREE.MeshStandardMaterial({
      color: 0xc0c0c0,
      metalness: 0.7,
      roughness: 0.3
    });
    const sink = new THREE.Mesh(sinkGeo, sinkMat);
    sink.position.set(0, 0.56, 0.15);
    group.add(sink);

    this.add(group);
  }

  applyEffects(crewMember, deltaTime) {
    if (crewMember.needs) {
      const rate = deltaTime / this.useDuration;
      crewMember.needs.hunger += this.needSatisfaction.hunger * rate;
      crewMember.needs.socialNeed += this.needSatisfaction.socialNeed * rate;
      if (crewMember.mood !== undefined) {
        crewMember.mood += this.needSatisfaction.mood * rate;
      }
    }
  }
}

export default GalleyStation;
