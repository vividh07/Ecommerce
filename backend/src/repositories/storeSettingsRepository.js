import { StoreSettings } from '../models/StoreSettings.js';

export const storeSettingsRepository = {
  async getSingleton() {
    let doc = await StoreSettings.findOne();
    if (!doc) {
      doc = await StoreSettings.create({});
    }
    return doc;
  },
  async updateSingleton(data) {
    let doc = await StoreSettings.findOne();
    if (!doc) {
      doc = await StoreSettings.create(data);
      return doc;
    }
    Object.assign(doc, data);
    await doc.save();
    return doc;
  },
};
