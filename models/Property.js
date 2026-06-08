import mongoose from 'mongoose';

const LocalizedString = new mongoose.Schema(
  {
    en: { type: String, default: '' },
    te: { type: String, default: '' },
    hi: { type: String, default: '' },
  },
  { _id: false }
);

const PropertySchema = new mongoose.Schema(
  {
    // human-readable id ("p-1735...") — kept for compatibility with existing UI
    id: { type: String, required: true, unique: true, index: true },

    type: {
      type: String,
      enum: ['agriculture', 'plot', 'house'],
      required: true,
    },
    location: { type: String, required: true },

    // Locality (only one of these blocks will be filled depending on `type`)
    village:   { type: String, default: '' },
    villageTe: { type: String, default: '' },
    villageHi: { type: String, default: '' },

    colony:   { type: String, default: '' },
    colonyTe: { type: String, default: '' },
    colonyHi: { type: String, default: '' },

    // Localized text
    title:       { type: LocalizedString, default: () => ({}) },
    description: { type: LocalizedString, default: () => ({}) },

    // Agriculture-specific
    areaAcres:    { type: Number, default: null },
    pricePerAcre: { type: Number, default: null },

    // Plot-specific
    areaSqYards:    { type: Number, default: null },
    pricePerSqYard: { type: Number, default: null },

    // House-specific
    plotArea:    { type: Number, default: null },
    builtUpArea: { type: Number, default: null },
    bedrooms:    { type: Number, default: null },

    // Common
    totalPrice: { type: Number, default: 0 },

    // Images: array of Cloudinary secure_url strings (with optional public_id for deletion)
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, default: '' },
        _id: false,
      },
    ],

    hotDeal: { type: Boolean, default: false },
    sold:    { type: Boolean, default: false },

    createdAt: { type: Number, default: () => Date.now() }, // numeric for legacy sort
  },
  { timestamps: { createdAt: '_createdAt', updatedAt: '_updatedAt' } }
);

// Returns a plain object shaped exactly like the existing front-end expects.
PropertySchema.methods.toClient = function () {
  const o = this.toObject({ versionKey: false });
  return {
    id: o.id,
    type: o.type,
    location: o.location,
    village: o.village, villageTe: o.villageTe, villageHi: o.villageHi,
    colony: o.colony, colonyTe: o.colonyTe, colonyHi: o.colonyHi,
    title: o.title,
    description: o.description,
    areaAcres: o.areaAcres,
    pricePerAcre: o.pricePerAcre,
    areaSqYards: o.areaSqYards,
    pricePerSqYard: o.pricePerSqYard,
    plotArea: o.plotArea,
    builtUpArea: o.builtUpArea,
    bedrooms: o.bedrooms,
    totalPrice: o.totalPrice,
    // Frontend uses plain string URLs — flatten the image objects
    images: (o.images || []).map((img) => img.url),
    hotDeal: !!o.hotDeal,
    sold: !!o.sold,
    createdAt: o.createdAt,
  };
};

export default mongoose.models.Property ||
  mongoose.model('Property', PropertySchema);