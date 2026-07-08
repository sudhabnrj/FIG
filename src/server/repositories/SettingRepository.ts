import { Setting, ISetting } from '../models/Setting';

export class SettingRepository {
  async findByKey(key: string): Promise<ISetting | null> {
    return Setting.findOne({ key }).exec();
  }

  async save(key: string, value: any): Promise<ISetting> {
    const setting = await Setting.findOneAndUpdate(
      { key },
      { $set: { value } },
      { new: true, upsert: true }
    ).exec();
    return setting;
  }

  async getAll(): Promise<ISetting[]> {
    return Setting.find().exec();
  }
}

export const settingRepository = new SettingRepository();
