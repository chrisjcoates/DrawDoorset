// Constants for view scaling and frame details
const VIEW_SCALING = 0.65;
const FRAME_THICKNESS = 32;
const AIR_GAP = 3;
const UNDER_FLOOR_GAP = 10;
const FD30_BEAD_CLEARANCE = 11 + 1;
const FD60_BEAD_CLEARANCE = 7 + 1;
const X = 100;
const Y = 100;
const HINGE_CLEARANCE_44MM = 4;
const HINGE_CLEARANCE_54MM = 5;

// Get input values as floats
function getInputValue(id) {
  return parseFloat(document.getElementById(id).value);
}

// Apply view scaling
function scaleValue(value) {
  return value - value * VIEW_SCALING;
}

// Get form values and scale
function getDimensions() {
  const doorWidthRight = getInputValue("door_width_right");
  const doorWidthLeft = getInputValue("door_width_left");
  const doorHeight = getInputValue("door_height");
  const doorThickness = getInputValue("doorThickness");
  const faceProtectionHeight = getInputValue("face_protection_height");
  const fireRating = document.getElementById("fireRating").value;
  const handing = document.getElementById("handing").value;

  // set hinge clearace based on door thickness
  let hingeClearance;
  if (doorThickness == 44) {
    hingeClearance = HINGE_CLEARANCE_44MM;
  } else {
    hingeClearance = HINGE_CLEARANCE_54MM;
  }

  const doorsetDimensions = {
    fireRating: fireRating,
    doorWidthRight: scaleValue(doorWidthRight),
    doorWidthLeft: scaleValue(doorWidthLeft),
    doorHeight: scaleValue(doorHeight),
    doorThickness: scaleValue(doorThickness),
    frameThickness: scaleValue(FRAME_THICKNESS),
    airGap: scaleValue(AIR_GAP),
    underFloorGap: scaleValue(UNDER_FLOOR_GAP),
    faceProcHeight: scaleValue(faceProtectionHeight),
    faceProcWidth: scaleValue(doorWidthLeft - AIR_GAP * 2),
    hingeClearance: scaleValue(hingeClearance),
    handing: handing,
  };

  // Set value of bead offset based on fire rating
  let beadOffset;
  if (
    doorsetDimensions.fireRating == "FD30" ||
    doorsetDimensions.fireRating == "NFR"
  ) {
    beadOffset = FD30_BEAD_CLEARANCE;
  } else {
    beadOffset = FD60_BEAD_CLEARANCE;
  }

  // Vision Panel values
  const vpDimensions = {
    vpTm: scaleValue(getInputValue("vp_tm")),
    vpSm: scaleValue(getInputValue("vp_sm")),
    vpAw: scaleValue(getInputValue("vp_aw")),
    vpA1l: scaleValue(getInputValue("vp_a1l")),
    beadOffset: scaleValue(beadOffset),
  };

  // Check if vp cut out is level with face protection height and adjust
  if (vpDimensions.vpA1l > 0 && doorsetDimensions.faceProcHeight > 0) {
    if (
      doorsetDimensions.doorHeight -
        (vpDimensions.vpTm + vpDimensions.vpA1l) -
        doorsetDimensions.faceProcHeight ==
      0
    ) {
      doorsetDimensions.faceProcHeight -= vpDimensions.beadOffset;
      document.getElementById("face_protection_height").value =
        faceProtectionHeight - beadOffset;
      alert("Face protection height adjusted to suite vp.");
    }
  }

  return { doorsetDimensions, vpDimensions };
}

// Clear and set up the canvas
function setupCanvas() {
  const canvas = document.getElementById("myCanvas");
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

// Draw the frame
function drawFrame(ctx, doorset) {
  // set the head width based on single or double doorset
  let headWidth;
  let rightDoorOffset = 0;
  if (doorset.doorWidthRight > 0) {
    headWidth =
      doorset.frameThickness * 2 +
      doorset.airGap * 3 +
      doorset.doorWidthLeft +
      doorset.doorWidthRight;
    rightDoorOffset = doorset.doorWidthRight + doorset.airGap;
  } else {
    headWidth =
      doorset.frameThickness * 2 + doorset.airGap * 2 + doorset.doorWidthLeft;
  }

  // Left leg
  ctx.strokeRect(
    X,
    Y + doorset.frameThickness,
    doorset.frameThickness,
    doorset.airGap + doorset.doorHeight + doorset.underFloorGap
  );
  // Right leg
  ctx.strokeRect(
    X +
      doorset.frameThickness +
      doorset.airGap * 2 +
      doorset.doorWidthLeft +
      rightDoorOffset,
    Y + doorset.frameThickness,
    doorset.frameThickness,
    doorset.airGap + doorset.doorHeight + doorset.underFloorGap
  );
  // Head
  ctx.strokeRect(X, Y, headWidth, doorset.frameThickness);
}

// Draw the door
function drawDoor(ctx, doorset) {
  let rightDoorOffset = 0;
  if (doorset.doorWidthRight > 0) {
    rightDoorOffset = doorset.doorWidthRight + doorset.airGap;
  }
  // Draw the left door
  ctx.strokeRect(
    X + doorset.frameThickness + doorset.airGap,
    Y + doorset.frameThickness + doorset.airGap,
    doorset.doorWidthLeft,
    doorset.doorHeight
  );
  // Draw the right door
  ctx.strokeRect(
    X + doorset.frameThickness + doorset.airGap + doorset.doorWidthLeft + doorset.airGap,
    Y + doorset.frameThickness + doorset.airGap,
    doorset.doorWidthRight,
    doorset.doorHeight
  );
}

// Draw the Vision Panels
function drawVisionPanels(ctx, doorset, vp) {
  let rightDoorOffset = 0;
  let vpXPos;

  if (doorset.doorWidthRight > 0 || doorset.handing == "LH") {
    rightDoorOffset = doorset.doorWidthRight + doorset.airGap;
    vpXPos =
      X +
      doorset.frameThickness +
      doorset.airGap +
      doorset.doorWidthLeft -
      vp.vpSm -
      vp.vpAw;
  } else {
    vpXPos = X + doorset.frameThickness + doorset.airGap + vp.vpSm;
  }

  const vpYPos = Y + doorset.frameThickness + doorset.airGap + vp.vpTm;

  if (vp.vpTm > 0 && vp.vpSm > 0 && vp.vpAw > 0 && vp.vpA1l > 0) {
    ctx.strokeRect(vpXPos, vpYPos, vp.vpAw, vp.vpA1l);
  }
}

// Draw face protection
function drawFaceProtection(ctx, doorset, vp) {
  // Set right door offset
  let rightDoorOffset = 0;
  if (doorset.doorWidthRight > 0) {
    rightDoorOffset = doorset.doorWidthRight + doorset.airGap;
  }
  const faceProcFromTopofDoor = doorset.doorHeight - doorset.faceProcHeight;

  // Check if full height face protection is selected
  let fullHeightCheck = document.getElementById("fullHeightProc");
  if (fullHeightCheck.checked) {
    doorset.faceProcHeight = doorset.doorHeight;
  }

  // Set face protection position

  let faceXPos = X + doorset.frameThickness + doorset.airGap * 2;
  let faceYPos =
    Y +
    doorset.frameThickness +
    doorset.airGap +
    doorset.doorHeight -
    doorset.faceProcHeight;

  // Draw face protection lines
  // left line
  ctx.beginPath();
  ctx.moveTo(faceXPos, faceYPos);
  ctx.lineTo(faceXPos, faceYPos + doorset.faceProcHeight);
  ctx.stroke();
  // bottom line
  ctx.beginPath();
  ctx.moveTo(faceXPos, faceYPos + doorset.faceProcHeight);
  ctx.lineTo(
    faceXPos + doorset.faceProcWidth,
    faceYPos + doorset.faceProcHeight
  );
  ctx.stroke();
  // right line
  ctx.beginPath();
  ctx.moveTo(
    faceXPos + doorset.faceProcWidth,
    faceYPos + doorset.faceProcHeight
  );
  ctx.lineTo(
    faceXPos + doorset.faceProcWidth,
    faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
  );
  ctx.stroke();
  // top line
  if (vp.vpTm + vp.vpA1l > faceProcFromTopofDoor && !document.getElementById("fullHeightProc").checked) {
    console.log("VP goes into face protection");
    // Handle Vision Panel collision with face protection
    if (doorset.doorWidthRight > 0 || doorset.handing == "LH") {
      // draw up to the vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + doorset.faceProcWidth,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
      );
      ctx.lineTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
      );
      ctx.stroke();

      // draw down the vp
      let vpLeftOverLength =
        doorset.faceProcHeight - (doorset.doorHeight - (vp.vpTm + vp.vpA1l));
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
      );
      ctx.lineTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight+ vpLeftOverLength + vp.beadOffset

      );
      ctx.stroke();

      // draw line across vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight+ vpLeftOverLength + vp.beadOffset
      );
      ctx.lineTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset - vp.vpAw - (vp.beadOffset * 2),
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight+ vpLeftOverLength + vp.beadOffset   
      );
      ctx.stroke();

      // draw line up vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset - vp.vpAw - (vp.beadOffset * 2),
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight+ vpLeftOverLength + vp.beadOffset 
      );
      ctx.lineTo(
        faceXPos + doorset.faceProcWidth - vp.vpSm + doorset.airGap + vp.beadOffset - vp.vpAw - (vp.beadOffset * 2),
        faceYPos
      );
      ctx.stroke();

      // return line
      ctx.beginPath();
      ctx.moveTo(faceXPos, faceYPos);
      ctx.lineTo(faceXPos + doorset.doorWidthLeft - vp.vpSm - vp.vpAw - vp.beadOffset - doorset.airGap, faceYPos);
      ctx.stroke();
    } else {
      // draw up to the vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + doorset.faceProcWidth,
        faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
      );
      ctx.lineTo(
        faceXPos + vp.vpSm + vp.vpAw - doorset.airGap + vp.beadOffset,
        faceYPos
      );
      ctx.stroke();

      // draw down the vp
      let vpLeftOverLength =
        doorset.faceProcHeight - (doorset.doorHeight - (vp.vpTm + vp.vpA1l));
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + vp.vpSm + vp.vpAw - doorset.airGap + vp.beadOffset,
        faceYPos
      );
      ctx.lineTo(
        faceXPos + vp.vpSm + vp.vpAw - doorset.airGap + vp.beadOffset,
        faceYPos + vpLeftOverLength + vp.beadOffset
      );
      ctx.stroke();

      // draw line across vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos + vp.vpSm + vp.vpAw - doorset.airGap + vp.beadOffset,
        faceYPos + vpLeftOverLength + vp.beadOffset
      );
      ctx.lineTo(
        faceXPos +
          vp.vpSm +
          vp.vpAw -
          doorset.airGap +
          vp.beadOffset -
          vp.vpAw -
          vp.beadOffset * 2,
        faceYPos + vpLeftOverLength + vp.beadOffset
      );
      ctx.stroke();

      // draw line up vp
      ctx.beginPath();
      ctx.moveTo(
        faceXPos +
          vp.vpSm +
          vp.vpAw -
          doorset.airGap +
          vp.beadOffset -
          vp.vpAw -
          vp.beadOffset * 2,
        faceYPos + vpLeftOverLength + vp.beadOffset
      );
      ctx.lineTo(
        faceXPos +
          vp.vpSm +
          vp.vpAw -
          doorset.airGap +
          vp.beadOffset -
          vp.vpAw -
          vp.beadOffset * 2,
        faceYPos
      );
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(faceXPos, faceYPos);
      ctx.lineTo(faceXPos + vp.vpSm - doorset.airGap - vp.beadOffset, faceYPos);
      ctx.stroke();
    }
  } else {
    console.log("VP does not go into face protection");
    ctx.beginPath();
    ctx.moveTo(
      faceXPos + doorset.faceProcWidth,
      faceYPos + doorset.faceProcHeight - doorset.faceProcHeight
    );
    ctx.lineTo(faceXPos, faceYPos);
    ctx.stroke();
  }
  // Draw the cutout around the vision panel
  // Get vp position
  let vpXPos;
  if (doorset.doorWidthRight > 0 || doorset.handing == "LH") {
    vpXPos = X + doorset.frameThickness + doorset.airGap + doorset.doorWidthLeft - vp.vpSm - vp.vpAw - vp.beadOffset;
  } else {
    vpXPos = X + doorset.frameThickness + doorset.airGap + vp.vpSm - vp.beadOffset;
  }

  let vpYPos = Y + doorset.frameThickness + doorset.airGap + vp.vpTm - vp.beadOffset;

  if (document.getElementById("fullHeightProc").checked) {
    ctx.strokeRect(vpXPos, vpYPos, vp.vpAw + (vp.beadOffset *2), vp.vpA1l + (vp.beadOffset *2));
  }
}

// Draw the doorset
function drawDoorset() {
  const { doorsetDimensions, vpDimensions } = getDimensions();
  const canvasCtx = setupCanvas();

  drawFrame(canvasCtx, doorsetDimensions);
  drawDoor(canvasCtx, doorsetDimensions);
  drawVisionPanels(canvasCtx, doorsetDimensions, vpDimensions);
  drawFaceProtection(canvasCtx, doorsetDimensions, vpDimensions);
}

// Resize canvas for high-DPI screens
function resizeCanvas() {
  const canvas = document.getElementById("myCanvas");

  // Adjust for high-DPI screens (e.g., Retina)
  const scale = window.devicePixelRatio;
  canvas.width = canvas.offsetWidth * scale;
  canvas.height = canvas.offsetHeight * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
}
