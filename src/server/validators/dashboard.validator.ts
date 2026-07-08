import { z } from 'zod';

export const userAdminUpdateSchema = z.object({
  role: z.enum(['guest', 'user', 'moderator', 'admin', 'super_admin']).optional(),
  status: z.enum(['pending_verification', 'active', 'suspended', 'blocked', 'deleted']).optional(),
});

export const siteSettingsValidator = z.object({
  siteName: z.string().min(2, 'Site name must be at least 2 characters').max(100),
  logo: z.string().optional().default(''),
  favicon: z.string().optional().default(''),
  footer: z.string().optional().default(''),
  contactEmail: z.string().email('Invalid support contact email'),
  timezone: z.string().optional().default('UTC'),
  maintenanceMode: z.boolean().optional().default(false),
});

export const seoSettingsValidator = z.object({
  metaTitle: z.string().min(2, 'SEO Meta title must be at least 2 characters'),
  metaDescription: z.string().min(10, 'SEO Description must be at least 10 characters'),
  keywords: z.string().default(''),
  openGraph: z.object({
    title: z.string(),
    description: z.string(),
  }).optional(),
  twitterCards: z.object({
    card: z.string(),
    site: z.string(),
  }).optional(),
  robots: z.string().optional().default('index, follow'),
  sitemap: z.string().optional().default('/sitemap.xml'),
});

export const securitySettingsValidator = z.object({
  jwtExpiration: z.string().default('15m'),
  sessionTimeout: z.number().default(30),
  passwordPolicy: z.object({
    minLength: z.number().default(8),
    requireSpecial: z.boolean().default(true),
    requireUppercase: z.boolean().default(true),
    requireNumber: z.boolean().default(true),
  }),
  allowedFileTypes: z.array(z.string()).default([]),
  maxFileSize: z.number().default(5),
});

export const roleValidator = z.object({
  name: z.string().min(2, 'Role name must be at least 2 characters').max(30),
  description: z.string().optional().default(''),
  permissions: z.array(z.string()).default([]),
});

export const bookmarkValidator = z.object({
  entityType: z.enum(['question', 'answer']),
  entityId: z.string().min(1, 'Entity reference ID is required'),
  category: z.string().optional().default('General'),
});
