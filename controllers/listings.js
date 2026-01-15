const Listing = require("../models/listing");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }
  console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  const { location, country } = req.body.listing;

  const geoResponse = await fetch(
    `https://api.maptiler.com/geocoding/${encodeURIComponent(
      `${location}, ${country}`
    )}.json?key=${process.env.MAP_TOKEN}`
  );

  const geoData = await geoResponse.json();

  if (!geoData.features || geoData.features.length === 0) {
    req.flash("error", "Invalid location entered");
    return res.redirect("/listings/new");
  }

  const coordinates = geoData.features[0].geometry.coordinates;

  // let {title, description, image, price, location, country } = req.body;
  let url = req.file.path;
  let filename = req.file.path;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = {
    type: "Point",
    coordinates: coordinates,
  };
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New listing created!");
  res.redirect("/listings");
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist!");
    return res.redirect("/listings");
  }

  let originalImgUrl = listing.image.url;
  originalImgUrl = originalImgUrl.replace("/upload", "/upload/h_300,w_250");
  res.render("listings/edit.ejs", { listing, originalImgUrl });
};

// module.exports.updateListing = async (req, res) => {
//   let { id } = req.params;
//   let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

//   if (typeof req.file !== "undefined") {
//     let url = req.file.path;
//     let filename = req.file.path;
//     listing.image = { url, filename };
//     await listing.save();
//   }
//   req.flash("success", "Listing Updated!");
//   res.redirect(`/listings/${id}`);
// };
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // 1️⃣ Find listing
  const listing = await Listing.findById(id);

  // 2️⃣ Update basic fields
  listing.title = req.body.listing.title;
  listing.description = req.body.listing.description;
  listing.price = req.body.listing.price;
  listing.location = req.body.listing.location;
  listing.country = req.body.listing.country;

  // 3️⃣ Update image if new one uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  }

  // 4️⃣ Re-geocode ONLY if location changed
  if (listing.isModified("location") || listing.isModified("country")) {
    const fetch = (...args) =>
      import("node-fetch").then(({ default: fetch }) => fetch(...args));

    const geoResponse = await fetch(
      `https://api.maptiler.com/geocoding/${encodeURIComponent(
        `${listing.location}, ${listing.country}`
      )}.json?key=${process.env.MAP_TOKEN}`
    );

    const geoData = await geoResponse.json();

    if (geoData.features && geoData.features.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: geoData.features[0].geometry.coordinates,
      };
    }
  }

  // 5️⃣ Save safely
  await listing.save();

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
