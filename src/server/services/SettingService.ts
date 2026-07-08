import { settingRepository } from '../repositories/SettingRepository';
import { ISetting } from '../models/Setting';

export class SettingService {
  async getSettings(key: string, defaults: any): Promise<any> {
    const setting = await settingRepository.findByKey(key);
    if (!setting) {
      const saved = await settingRepository.save(key, defaults);
      return saved.value;
    }
    return setting.value;
  }

  async updateSettings(key: string, value: any): Promise<any> {
    const updated = await settingRepository.save(key, value);
    return updated.value;
  }

  async getSiteSettings(): Promise<any> {
    return this.getSettings('site_settings', {
      siteName: 'Interview Guide',
      logo: '',
      favicon: '',
      footer: '© 2026 Frontend Interview Guide',
      contactEmail: 'support@interviewguide.com',
      timezone: 'UTC',
      maintenanceMode: false,
    });
  }

  async getSeoSettings(): Promise<any> {
    return this.getSettings('seo_settings', {
      metaTitle: 'Frontend Interview Guide',
      metaDescription: 'The ultimate resource to prepare for Frontend Engineering interviews.',
      keywords: 'frontend, interview, react, javascript, css, html, nextjs',
      openGraph: { title: 'Frontend Interview Guide', description: 'The ultimate resource to prepare for Frontend Engineering interviews.' },
      twitterCards: { card: 'summary_large_image', site: '@frontendguide' },
      robots: 'index, follow',
      sitemap: '/sitemap.xml',
    });
  }

  async getSecuritySettings(): Promise<any> {
    return this.getSettings('security_settings', {
      jwtExpiration: '15m',
      sessionTimeout: 30,
      passwordPolicy: { minLength: 8, requireSpecial: true, requireUppercase: true, requireNumber: true },
      allowedFileTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'application/zip'],
      maxFileSize: 5,
    });
  }
}

export const settingService = new SettingService();
