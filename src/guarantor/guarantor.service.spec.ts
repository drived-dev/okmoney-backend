import { FirebaseRepository } from '@/firebase/firebase.service';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { GUARANTOR_COLLECTION, GuarantorService } from './guarantor.service';

describe('GuarantorService', () => {
  let service: GuarantorService;

  const mockFirebaseRepository = {
    db: {
      collection: jest.fn(),
    },
  };

  const mockCollection = {
    add: jest.fn(),
  };

  const mockDocRef = {
    id: 'mockedDocId',
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      providers: [
        GuarantorService,
        { provide: FirebaseRepository, useValue: mockFirebaseRepository },
      ],
    }).compile();

    service = module.get<GuarantorService>(GuarantorService);

    // Mock Firestore interactions
    mockFirebaseRepository.db.collection.mockReturnValue(mockCollection);
    mockCollection.add.mockResolvedValue(mockDocRef);
    mockDocRef.get.mockResolvedValue({
      data: jest.fn().mockReturnValue({
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        createdAt: 1699999999999,
        updatedAt: 1699999999999,
      }),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a guarantor successfully', async () => {
      const createGuarantorDto = {
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
      };

      const result = await service.create(createGuarantorDto);

      // Assertions
      expect(mockFirebaseRepository.db.collection).toHaveBeenCalledWith(
        GUARANTOR_COLLECTION, // Replace with your actual guarantorCollection name
      );
      expect(mockCollection.add).toHaveBeenCalledWith({
        ...createGuarantorDto,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
      expect(mockDocRef.get).toHaveBeenCalled();
      expect(result).toEqual({
        id: 'mockedDocId',
        firstName: 'John',
        lastName: 'Doe',
        phoneNumber: '+1234567890',
        createdAt: 1699999999999,
        updatedAt: 1699999999999,
      });
    });
  });
});
