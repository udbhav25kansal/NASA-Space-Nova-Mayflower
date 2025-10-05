/**
 * Workstation.js - Desk with computer for crew work
 */

import * as THREE from 'three';
import HabitatObject from '../HabitatObject.js';

class Workstation extends HabitatObject {
  constructor(objectId, tileX, tileY, moduleId) {
    super('workstation', objectId, tileX, tileY, moduleId);

    this.useDuration = 30.0;  // 30 minutes work session
    this.needSatisfaction = {
      stress: 5,              // Work can increase stress
      recreationNeed: 10      // Increases need for recreation
    };
  }

  createVisual() {
    const group = new THREE.Group();

    // Desk
    const deskGeo = new THREE.BoxGeometry(0.8, 0.05, 0.5);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x8b7355 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.y = 0.4;
    group.add(desk);

    // Legs
    const legGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.4);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x696969 });

    const positions = [
      [-0.35, 0.2, -0.2],
      [0.35, 0.2, -0.2],
      [-0.35, 0.2, 0.2],
      [0.35, 0.2, 0.2]
    ];

    positions.forEach(pos => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(...pos);
      group.add(leg);
    });

    // Monitor
    const monitorGeo = new THREE.BoxGeometry(0.4, 0.3, 0.05);
    const monitorMat = new THREE.MeshStandardMaterial({
      color: 0x1e1e1e,
      emissive: 0x0066cc,
      emissiveIntensity: 0.2
    });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 0.6, -0.15);
    group.add(monitor);

    // Keyboard
    const keyboardGeo = new THREE.BoxGeometry(0.3, 0.02, 0.15);
    const keyboardMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const keyboard = new THREE.Mesh(keyboardGeo, keyboardMat);
    keyboard.position.set(0, 0.43, 0.1);
    group.add(keyboard);

    this.add(group);
  }

  applyEffects(crewMember, deltaTime) {
    if (crewMember.needs) {
      const rate = deltaTime / this.useDuration;
      crewMember.needs.stress += this.needSatisfaction.stress * rate;
      crewMember.needs.recreationNeed += this.needSatisfaction.recreationNeed * rate;
    }
  }
}

export default Workstation;
