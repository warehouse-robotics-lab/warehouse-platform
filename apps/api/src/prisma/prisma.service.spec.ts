import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  const configService = {
    getOrThrow: jest
      .fn()
      .mockReturnValue(
        'postgresql://warehouse:warehouse@localhost:5432/warehouse',
      ),
  } as unknown as ConfigService;

  let service: PrismaService;

  beforeEach(() => {
    service = new PrismaService(configService);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await service.$disconnect();
  });

  it('connects on module init', async () => {
    const connect = jest.spyOn(service, '$connect').mockResolvedValue();

    await service.onModuleInit();

    expect(connect).toHaveBeenCalledTimes(1);
  });

  it('disconnects on module destroy', async () => {
    const disconnect = jest.spyOn(service, '$disconnect');

    await service.onModuleDestroy();

    expect(disconnect).toHaveBeenCalledTimes(1);
  });
});
