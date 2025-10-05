/**
 * ExerciseEquipment.js - Exercise machines (treadmill, bike, etc.)
 */

import * as THREE from 'three';
import HabitatObject from '../HabitatObject.js';

class ExerciseEquipment extends HabitatObject {
  constructor(objectId, tileX, tileY, moduleId) {
    super('exercise_equipment', objectId, tileX, tileY, moduleId);

    this.useDuration = 15.0;  // 15 minutes typical exercise
    this.needSatisfaction = {
      exercise: -30,          // Reduces exercise need by 30
      stress: -10,            // Reduces stress by 10
      fatigue: 5              // Slightly increases fatigue
    };
  }

  createVisual() {
    // Treadmill/bike representation
    const group = new THREE.Group();

    // Base
    const baseGeo = new THREE.BoxGeometry(0.6, 0.1, 1.0);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x2c3e50 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.05;
    group.add(base);

    // Console
    const consoleGeo = new THREE.BoxGeometry(0.4, 0.6, 0.1);
    const consoleMat = new THREE.MeshStandardMaterial({ color: 0x34495e });
    const console = new THREE.Mesh(consoleGeo, consoleMat);
    console.position.set(0, 0.4, -0.4);
    group.add(console);

    // Handles
    const handleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.5);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0x7f8c8d });

    const leftHandle = new THREE.Mesh(handleGeo, handleMat);
    leftHandle.position.set(-0.2, 0.5, -0.3);
    group.add(leftHandle);

    const rightHandle = new THREE.Mesh(handleGeo, handleMat);
    rightHandle.position.set(0.2, 0.5, -0.3);
    group.add(rightHandle);

    this.add(group);
  }

  applyEffects(crewMember, deltaTime) {
    if (crewMember.needs) {
      // Apply effects over time
      const rate = deltaTime / this.useDuration;
      crewMember.needs.exercise += this.needSatisfaction.exercise * rate;
      crewMember.needs.stress += this.needSatisfaction.stress * rate;
      crewMember.needs.fatigue += this.needSatisfaction.fatigue * rate;
    }
  }
}

export default ExerciseEquipment;
