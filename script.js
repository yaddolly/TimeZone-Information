async function getLocation(location) {
    const apiKey = "b221aa5cf471413f9671db116797d760";
    const maxRetries = 5;
    let retries = 0;
  
    let address;
    if (location === "current") {
      try {
        const position = await new Promise((resolve, reject) => {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          } else {
            reject(new Error("Geolocation not supported"));
          }
        });
        address = `${position.coords.latitude},${position.coords.longitude}`;
      } catch (error) {
        console.error("Error getting current location : ", error);
        return;
      }
    } else {
      address = encodeURIComponent(location);
    }
  
    const url = `https://api.geoapify.com/v1/geocode/search?text=${address}&apiKey=${apiKey}`;
  
    while (retries < maxRetries) {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        retrieveData(data);
        return;
      } catch (error) {
        console.error("Error fetching data:", error);
        retries++;
      }
    }
  }
  
  function retrieveData(data) {
    data = data.features[0].properties;
    values.name = data.timezone.name;
    values.latitude = data.lat;
    values.longitude = data.lon;
    values.offsetSTD = data.timezone.offset_STD;
    values.offsetSTDSeconds = data.timezone.offset_STD_seconds;
    values.offsetDST = data.timezone.offset_DST;
    values.offsetDSTSeconds = data.timezone.offset_DST_seconds;
    values.country = data.country;
    values.city = data.city;
    values.postcode = data.postcode;
    if (!currentUpdated) {
      updateDOM("currentTimeZone");
    } else {
      createResultContainer();
      updateDOM("searchTimeZone");
    }
  }
  
  function updateDOM(id) {
    document.querySelector(`#${id} .name .value`).innerText = values.name || "";
    document.querySelector(`#${id} .latitude .value`).innerText =
      values.latitude || "";
    document.querySelector(`#${id} .longitude .value`).innerText =
      values.longitude || "";
    document.querySelector(`#${id} .offsetSTD .value`).innerText =
      values.offsetSTD || "";
    document.querySelector(`#${id} .offsetSTDSeconds .value`).innerText =
      values.offsetSTDSeconds || "";
    document.querySelector(`#${id} .offsetDST .value`).innerText =
      values.offsetDST || "";
    document.querySelector(`#${id} .offsetDSTSeconds .value`).innerText =
      values.offsetDSTSeconds || "";
    document.querySelector(`#${id} .country .value`).innerText =
      values.country || "";
    try {
      document.querySelector(`#${id} .city .value`).innerText = values.city || "";
      document.querySelector(`#${id} .postcode .value`).innerText =
        values.postcode || "";
    } catch (error) {}
  
    if (!currentUpdated) {
      currentUpdated = true;
    }
  }
  
  function createResultContainer() {
    if (document.querySelector("#result") !== null) {
      document.querySelector("#result").remove();
    }
  
    const searchContainer = document.querySelector("#searchTimeZone");
    const result = document.createElement("div");
    result.id = "result";
  
    result.innerHTML = `
      <h1>Your Result</h1>
      <section class="display">
        <div class="name flex">
          <p>Name of Time Zone :</p>
          <p class="value"></p>
        </div>
        <div class="coord">
          <div class="latitude flex">
            <p>Lat :</p>
            <p class="value"></p>
          </div>
          <div class="longitude flex">
            <p>Long :</p>
            <p class="value"></p>
          </div>
        </div>
        <div class="offsetSTD flex">
          <p>Offset STD :</p>
          <p class="value"></p>
        </div>
        <div class="offsetSTDSeconds flex">
          <p>Offset STD Seconds :</p>
          <p class="value"></p>
        </div>
        <div class="offsetDST flex">
          <p>Offset DST :</p>
          <p class="value"></p>
        </div>
        <div class="offsetDSTSeconds flex">
          <p>Offset DST Seconds :</p>
          <p class="value"></p>
        </div>
        <div class="country flex">
          <p>Country :</p>
          <p class="value"></p>
        </div>
      </section>
      `;
  
    searchContainer.appendChild(result);
  }
  
  document.addEventListener("DOMContentLoaded", (e) => {
    getLocation("current");
  });
  
  const values = {};
  let currentUpdated = false;
  
  const form = document.querySelector(".form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    getLocation(form.address.value.trim());
    form.reset();
  });
  