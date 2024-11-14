import { FirebaseRepository } from '@/firebase/firebase.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
    doc: jest.fn(),
  };

  const mockDocRef = {
    id: 'mockedDocId',
    get: jest.fn(),
    delete: jest.fn(),
  };

  const mockGetDoc = {
    exists: jest.fn(),
  };

  const createGuarantorDto = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
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
    mockCollection.doc.mockReturnValue(mockDocRef);
    mockDocRef.get.mockResolvedValue(mockGetDoc);
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

    it('should throw an error when creating a guarantor fails', async () => {
      mockCollection.add.mockRejectedValueOnce(
        new Error('Failed to create guarantor'),
      );

      const result = service.create(createGuarantorDto);
      await expect(result).rejects.toThrow(InternalServerErrorException);

      expect(mockFirebaseRepository.db.collection).toHaveBeenCalledWith(
        GUARANTOR_COLLECTION,
      );
      expect(mockCollection.add).toHaveBeenCalledWith({
        ...createGuarantorDto,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
    });
  });

  describe('findById', () => {
    it('should find a guarantor by id successfully', async () => {
      mockDocRef.get.mockResolvedValue({
        exists: true,
      });

      const result = await service.findById(mockDocRef.id);

      expect(result).toStrictEqual(mockDocRef);
      expect(mockFirebaseRepository.db.collection).toHaveBeenCalledWith(
        GUARANTOR_COLLECTION,
      );
      expect(mockCollection.doc).toHaveBeenCalledWith(mockDocRef.id);
      expect(mockDocRef.get).toHaveBeenCalled();
    });

    it('should throw an error when guarantor does not exist', async () => {
      mockDocRef.get.mockResolvedValue({
        exists: false,
      });

      const result = service.findById(mockDocRef.id);
      await expect(result).rejects.toThrow(NotFoundException);
    });
  });
});
