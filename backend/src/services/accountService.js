import { ApiError } from '../utils/ApiError.js';
import { userRepository } from '../repositories/userRepository.js';
import { publicUser } from './authService.js';

function mapAddress(doc) {
  const a = doc.toObject ? doc.toObject() : doc;
  return {
    _id: a._id,
    label: a.label || 'Home',
    fullName: a.fullName,
    phone: a.phone,
    line1: a.line1,
    line2: a.line2 || '',
    city: a.city,
    state: a.state,
    postalCode: a.postalCode,
    country: a.country || 'IN',
    isDefault: Boolean(a.isDefault),
    createdAt: a.createdAt,
    updatedAt: a.updatedAt,
  };
}

function mapNotification(doc) {
  const n = doc.toObject ? doc.toObject() : doc;
  return {
    _id: n._id,
    title: n.title,
    body: n.body || '',
    href: n.href || '',
    read: Boolean(n.read),
    createdAt: n.createdAt,
  };
}

export const accountService = {
  async updateProfile(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    user.name = data.name;
    user.phone = data.phone ?? '';
    user.phoneCountryCode = data.phoneCountryCode || '+91';
    if (data.notificationPrefs) {
      user.notificationPrefs = {
        orderUpdates: data.notificationPrefs.orderUpdates !== false,
        marketing: Boolean(data.notificationPrefs.marketing),
      };
    }
    await user.save();
    return publicUser(user);
  },

  async listAddresses(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return (user.addresses || []).map(mapAddress);
  },

  async addAddress(userId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    if (data.isDefault || !(user.addresses || []).length) {
      for (const a of user.addresses || []) a.isDefault = false;
      data.isDefault = true;
    }

    user.addresses.push(data);
    await user.save();
    return mapAddress(user.addresses[user.addresses.length - 1]);
  },

  async updateAddress(userId, addressId, data) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(404, 'Address not found');

    Object.assign(address, data);
    if (data.isDefault) {
      for (const a of user.addresses) {
        if (a._id.toString() !== String(addressId)) a.isDefault = false;
      }
      address.isDefault = true;
    }

    await user.save();
    return mapAddress(address);
  },

  async deleteAddress(userId, addressId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');

    const address = user.addresses.id(addressId);
    if (!address) throw new ApiError(404, 'Address not found');

    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length) {
      user.addresses[0].isDefault = true;
    }
    await user.save();
    return { deleted: true };
  },

  async listNotifications(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    return (user.notifications || []).map(mapNotification);
  },

  async markNotificationRead(userId, notificationId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    const note = user.notifications.id(notificationId);
    if (!note) throw new ApiError(404, 'Notification not found');
    note.read = true;
    await user.save();
    return mapNotification(note);
  },

  async markAllNotificationsRead(userId) {
    const user = await userRepository.findById(userId);
    if (!user) throw new ApiError(404, 'User not found');
    for (const n of user.notifications || []) n.read = true;
    await user.save();
    return (user.notifications || []).map(mapNotification);
  },

  async pushNotification(userId, { title, body = '', href = '' }) {
    if (!userId) return null;
    return userRepository.pushNotification(userId, { title, body, href, read: false });
  },
};
