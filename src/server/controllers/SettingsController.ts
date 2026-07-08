import { NextResponse } from 'next/server';
import { AuthenticatedNextRequest } from '../middlewares/auth';
import { settingService } from '../services/SettingService';
import { siteSettingsValidator, seoSettingsValidator, securitySettingsValidator } from '../validators/dashboard.validator';
import { auditLogService } from '../services/AuditLogService';

export class SettingsController {
  async getSiteSettings(request: AuthenticatedNextRequest) {
    const settings = await settingService.getSiteSettings();
    return NextResponse.json({ success: true, data: settings });
  }

  async updateSiteSettings(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = siteSettingsValidator.parse(body);

    const updated = await settingService.updateSettings('site_settings', validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'SITE_SETTINGS_UPDATED',
      validated,
      request
    );

    return NextResponse.json({ success: true, data: updated });
  }

  async getSeoSettings(request: AuthenticatedNextRequest) {
    const settings = await settingService.getSeoSettings();
    return NextResponse.json({ success: true, data: settings });
  }

  async updateSeoSettings(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = seoSettingsValidator.parse(body);

    const updated = await settingService.updateSettings('seo_settings', validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'SEO_SETTINGS_UPDATED',
      validated,
      request
    );

    return NextResponse.json({ success: true, data: updated });
  }

  async getSecuritySettings(request: AuthenticatedNextRequest) {
    const settings = await settingService.getSecuritySettings();
    return NextResponse.json({ success: true, data: settings });
  }

  async updateSecuritySettings(request: AuthenticatedNextRequest) {
    const body = await request.json();
    const validated = securitySettingsValidator.parse(body);

    const updated = await settingService.updateSettings('security_settings', validated);

    await auditLogService.logAction(
      request.user._id.toString(),
      'SECURITY_SETTINGS_UPDATED',
      validated,
      request
    );

    return NextResponse.json({ success: true, data: updated });
  }
}

export const settingsController = new SettingsController();
