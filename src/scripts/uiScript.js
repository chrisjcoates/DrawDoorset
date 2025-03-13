function switchContainer(targetContainerID) {

    document.getElementById("details-container").style.display = "none";
    document.getElementById("door-container").style.display = "none";
    document.getElementById("frame-container").style.display = "none";
    document.getElementById("face-protection-container").style.display = "none";
    document.getElementById("vision-panels-container").style.display = "none";
    document.getElementById(targetContainerID).style.display = "flex";

}