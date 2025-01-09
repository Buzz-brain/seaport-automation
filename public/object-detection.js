let model;

// Load the Coco SSD model
async function loadModel() {
  try {
    model = await cocoSsd.load();
    console.log("Model loaded successfully:", model);
  } catch (error) {
    console.error("Error loading Coco SSD model:", error);
    alert("Failed to load the Coco SSD model. Please check your internet connection and model URL.");
  }
}

loadModel();

async function detectObjects(canvas) {
  if (!model) {
    throw new Error("Model not loaded");
  }
  const predictions = await model.detect(canvas);
  return predictions;
}

// async function detectObjects(image) {
//   if (!model) {
//     throw new Error("Model not loaded");
//   }
//   const predictions = await model.detect(image);
//   return predictions;
// }
