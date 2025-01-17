import axios from "axios";
import $ from "jquery";

function toTitleCase(str: string) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}


type Unit = {
  id: number;
  unit_number: number;
  unit_category: number;
  status: "booked" | "available";
  created: string;
};

type UnitCategory = {
  id: number;
  status: "booked" | "available";
  is_hidden: boolean;
  join_waitlist: boolean;
  size: string;
  details: string;
  price: string;
  units: Unit[];
};

const renderUnitSkeleton = () => {
  return `
    <tr>
    <td>
      <div class="skeleton h-6 w-36"></div>
    </td>
    <td>
    <div class="skeleton h-6 w-24"></div>
    </td>
    <td>
    <div class="skeleton h-6 w-24"></div>
    </td>
    <td class="flex justify-center">
    <div class="skeleton h-6 w-32 "></div>
    </td>
  </tr>
    `;
};

//@ts-ignore
window.showWaitlistModal = () => {
  $("#waitlist-modal").show();
};

const renderUnitRow = (uc: UnitCategory) => {
  const cta =
    uc.status === "available"
      ? `<a class="btn btn-primary w-32" href="https://booking.localocker.com/booking/1?unitCategory=${uc.id}">
        Book Now
      </a>`
      : `<button class="btn btn-secondary w-32" onclick="showWaitlistModal()">
        Join Waitlist
      </button>`;
  return `
    <tr>
    <td>
      ${uc.size}
    </td>
    <td>
      ${toTitleCase(uc.status)}
    </td>
    <td>
      $${uc.price}
    </td>
    <td class="flex justify-center">
      ${cta}
    </td>
  </tr>
    `;
};

const fetchUnitCategories = async (id) => {
  const res = await axios.get(`https://admin.localocker.com/location/${id}/`);
  const { data } = res;
  return data.unit_categories as UnitCategory[];
};

const renderUnits = async () => {
  const tableBodyContainer = document.getElementById("units-table-body");

  //   Load Skeleton
  tableBodyContainer.innerHTML = renderUnitSkeleton().repeat(3);

  // Run API Request
  var script_tag = document.getElementById('units-script');
  var entityId = script_tag.getAttribute('data');
  const unitCategories = await fetchUnitCategories(entityId);

  console.log(unitCategories);
  //Load Content
  tableBodyContainer.innerHTML = unitCategories
    // .filter((uc) => uc.status === "available")
    .filter(uc => (uc.status === "available" && uc.is_hidden === false) || (uc.status === "booked" && uc.join_waitlist === true && uc.is_hidden === false))
    .map((uc) => renderUnitRow(uc))
    .join("");
};

const hookupForm = () => {
  const waitlistForm = document.getElementById("waitlist-form");
  waitlistForm.onsubmit = (e) => {
    e.preventDefault();
    const formDataArray = $("#waitlist-form").serializeArray();
    const formData = {};

    formDataArray.forEach((i) => {
      formData[i.name] = i.value || "";
    });

    document.getElementById("waitlist-form");
    console.log(formData);

    // axios.post(
    //   "https://webhook.site/#!/e4128d2d-9449-4f25-a229-c84a1945a531/008ff727-edaa-4620-bce7-5bb2c814d365/1",
    //   formData
    // );

    $("#waitlist-modal").hide();
  };
};

document.addEventListener("DOMContentLoaded", function (event) {
  //do work
  renderUnits();
  hookupForm();
});
