import { Test, TestingModule } from '@nestjs/testing';
import { SecurityService } from './security.service';
import { faker } from '@faker-js/faker';

describe('SecurityService', () => {
  let service: SecurityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SecurityService],
    }).compile();

    service = module.get<SecurityService>(SecurityService);
  });

  it('Should generate valid private and public keys', () => {
    const keys = service.generateKeys();

    const publicKey = Buffer.from(keys.publicKey, 'base64').toString('utf-8');
    const privateKey = Buffer.from(keys.privateKey, 'base64').toString('utf-8');
    const text = faker.lorem.sentence();

    const encryptedText = service.encrypt(text, publicKey);
    const decryptedText = service.decrypt(encryptedText, privateKey);

    expect(decryptedText).toEqual(text);
  });
});
