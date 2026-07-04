import { describe, it, expect, vi } from 'vitest';
import { GET } from './route';
import { NextResponse } from 'next/server';

// Mock dbConnect
vi.mock('../../../../server/config/database', () => ({
  dbConnect: vi.fn().mockResolvedValue(true),
}));

describe('Health Route Handler', () => {
  it('should return health status data', async () => {
    const req = {} as any;
    const response = await GET(req);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response.status).toBe(200);

    const json = await response.json();
    expect(json.success).toBe(true);
    expect(json.data.status).toBe('UP');
    expect(json.data.database).toBe('CONNECTED');
  });
});
