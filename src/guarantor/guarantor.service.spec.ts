import { FirebaseRepository } from '../firebase/firebase.service';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateGuarantorDto } from './dto/create-guarantor.dto';
import { Guarantor } from './entities/guarantor.entity';
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

  const mockId = 'mockedDocId';

  const mockDocRef = {
    id: mockId,
    get: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockGetDoc = {
    exists: jest.fn(),
    data: jest.fn(),
  };

  const createGuarantorData: CreateGuarantorDto = {
    firstName: 'John',
    lastName: 'Doe',
    phoneNumber: '+1234567890',
  };

  const returnGuarantorData: Guarantor = {
    ...createGuarantorData,
    id: mockId,
    createdAt: 1699999999999,
    updatedAt: 1699999999999,
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
    mockGetDoc.data.mockReturnValue(returnGuarantorData);
    mockGetDoc.exists.mockReturnValue(true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a guarantor successfully', async () => {
      const result = await service.create(createGuarantorData);

      // Assertions
      expect(mockFirebaseRepository.db.collection).toHaveBeenCalledWith(
        GUARANTOR_COLLECTION, // Replace with your actual guarantorCollection name
      );
      expect(mockCollection.add).toHaveBeenCalledWith({
        ...createGuarantorData,
        createdAt: expect.any(Number),
        updatedAt: expect.any(Number),
      });
      expect(mockDocRef.get).toHaveBeenCalled();
      expect(result).toEqual(returnGuarantorData);
    });

    it('should throw an error when creating a guarantor fails', async () => {
      mockCollection.add.mockRejectedValueOnce(
        new Error('Failed to create guarantor'),
      );

      const result = service.create(createGuarantorData);
      await expect(result).rejects.toThrow(InternalServerErrorException);

      expect(mockFirebaseRepository.db.collection).toHaveBeenCalledWith(
        GUARANTOR_COLLECTION,
      );
      expect(mockCollection.add).toHaveBeenCalledWith({
        ...createGuarantorData,
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

  describe('findOne', () => {
    it('should find a guarantor by id successfully', async () => {
      jest.spyOn(service, 'findById').mockResolvedValue(mockDocRef as any);

      const result = await service.findOne(mockDocRef.id);

      expect(result).toEqual(returnGuarantorData);
      expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
    });

    it('should throw an error when guarantor does not exist', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValueOnce(new NotFoundException('Guarantor not found'));

      const result = service.findOne(mockDocRef.id);
      await expect(result).rejects.toThrow(NotFoundException);

      expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
    });

    it('should throw an error when finding a guarantor fails', async () => {
      jest
        .spyOn(service, 'findById')
        .mockRejectedValueOnce(new InternalServerErrorException());

      const result = service.findOne(mockDocRef.id);
      await expect(result).rejects.toThrow(InternalServerErrorException);

      expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
    });

    describe('remove', () => {
      it('should remove a guarantor successfully', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(mockDocRef as any);

        const result = await service.remove(mockDocRef.id);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
        expect(mockDocRef.delete).toHaveBeenCalled();
        expect(result.success).toBe(true);
      });

      it('should throw an error when guarantor does not exist', async () => {
        jest
          .spyOn(service, 'findById')
          .mockRejectedValueOnce(new NotFoundException('Guarantor not found'));

        const result = service.remove(mockDocRef.id);
        await expect(result).rejects.toThrow(NotFoundException);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
      });

      it('should throw an error when deleting a guarantor fails', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(mockDocRef as any);
        mockDocRef.delete.mockRejectedValueOnce(
          new Error('Failed to delete guarantor'),
        );

        const result = service.remove(mockDocRef.id);
        await expect(result).rejects.toThrow(InternalServerErrorException);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
        expect(mockDocRef.delete).toHaveBeenCalled();
      });
    });

    describe('update', () => {
      it('should update a guarantor successfully', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(mockDocRef as any);

        const result = await service.update(mockDocRef.id, createGuarantorData);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
        expect(mockDocRef.update).toHaveBeenCalledWith({
          ...createGuarantorData,
          updatedAt: expect.any(Number),
        });
        expect(result.success).toBe(true);
      });

      it('should throw an error when guarantor does not exist', async () => {
        jest
          .spyOn(service, 'findById')
          .mockRejectedValueOnce(new NotFoundException('Guarantor not found'));

        const result = service.update(mockDocRef.id, createGuarantorData);
        await expect(result).rejects.toThrow(NotFoundException);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
      });

      it('should throw an error when updating a guarantor fails', async () => {
        jest.spyOn(service, 'findById').mockResolvedValue(mockDocRef as any);
        mockDocRef.update.mockRejectedValueOnce(
          new Error('Failed to update guarantor'),
        );

        const result = service.update(mockDocRef.id, createGuarantorData);
        await expect(result).rejects.toThrow(InternalServerErrorException);

        expect(service.findById).toHaveBeenCalledWith(mockDocRef.id);
        expect(mockDocRef.update).toHaveBeenCalledWith({
          ...createGuarantorData,
          updatedAt: expect.any(Number),
        });
      });
    });
  });
});
