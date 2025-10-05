/**
 * SleepPod.js - Sleeping quarters/bed
 */

import * as THREE from 'three';
import HabitatObject from '../HabitatObject.js';

class SleepPod extends HabitatObject {
  constructor(objectId, tileX, tileY, moduleId) {
    super('sleep_pod', objectId, tileX, tileY, moduleId);

    this.useDuration = 480.0;  // 8 hours sleep
    this.needSatisfaction = {
      fatigue: -80,            // Greatly reduces fatigue
      stress: -20,             // Reduces stress
      mood: 10                 // Improves mood
    };
  }

  createVisual() {
    const group = new THREE.Group();

    // Bed frame
    const frameGeo = new THREE.BoxGeometry(0.9, 0.1, 1.8);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x5a5a5a });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.y = 0.2;
    group.add(frame);

    // Mattress
    const mattressGeo = new THREE.BoxGeometry(0.8, 0.15, 1.7);
    const mattressMat = new THREE.MeshStandardMaterial({
      color: 0xe0e0e0,
      roughness: 0.8
    });
    const mattress = new THREE.Mesh(mattressGeo, mattressMat);
    mattress.position.y = 0.325;
    group.add(mattress);

    // Pillow
    const pillowGeo = new THREE.BoxGeometry(0.4, 0.1, 0.3);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f5 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(0, 0.45, -0.6);
    group.add(pillow);

    // Privacy curtain rod
    const rodGeo = new THREE.CylinderGeometry(0.015, 0.015, 1.0);
    const rodMat = new THREE.MeshStandardMaterial({ color: 0x808080 });
    const rod = new THREE.Mesh(rodGeo, rodMat);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(0, 1.0, -0.9);
    group.add(rod);

    this.add(group);
  }

  applyEffects(crewMember, deltaTime) {
    if (crewMember.needs) {
      const rate = deltaTime / this.useDuration;
      crewMember.needs.fatigue += this.needSatisfaction.fatigue * rate;
      crewMember.needs.stress += this.needSatisfaction.stress * rate;
      if (crewMember.mood !== undefined) {
        crewMember.mood += this.needSatisfaction.mood * rate;
      }
    }
  }
}

export default SleepPod;
