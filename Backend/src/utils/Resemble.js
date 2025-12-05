



// Utility to compare two images using resemblejs.
// Note: we load resemblejs lazily inside the function so that
// the rest of the app can start even if resemblejs / canvas
// is not available or not building correctly.

const DifferencePercentage = async () => {
  try {
    // Dynamic import so failure to load resemblejs does not crash the app at startup
    const resembleModule = await import("resemblejs");
    const resemble = resembleModule.default || resembleModule;

    return await new Promise((resolve, reject) => {
      resemble("plant_day1.jpg")
        .compareTo("plant_day2.jpg")
        .ignoreColors()
        .ignoreAntialiasing()
        .scaleToSameSize()
        .onComplete((data) => {
          try {
            console.log("Difference %:", data.misMatchPercentage);
            const difference = parseFloat(data.misMatchPercentage);
            resolve(difference);
          } catch (err) {
            reject(err);
          }
        });
    });
  } catch (error) {
    console.error("resemblejs error", error);
    // Return null so callers can handle the failure gracefully
    return null;
  }
};

export default DifferencePercentage;


