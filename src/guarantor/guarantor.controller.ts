import { MockAuthGuard } from '@/auth/mockAuthGuard';
import { AuthReqType } from '@/auth/reqType';
import { Loan } from '@/loan/entities/loan.entity';
import { LoanService } from '@/loan/loan.service';
import { ResponseDto } from '@/types/response.dto';
import { ApiAuthorizationHeader } from '@/utils/auth.decorator';
import { ZodPipe } from '@/utils/zodPipe';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  CreateGuarantorDto,
  CreateGuarantorScehma,
} from './dto/create-guarantor.dto';
import { UpdateGuarantorDto } from './dto/update-guarantor.dto';
import { Guarantor } from './entities/guarantor.entity';
import { GuarantorService } from './guarantor.service';
import { FieldValue } from 'firebase-admin/firestore';

@ApiTags('Guarantor')
@Controller('guarantor')
export class GuarantorController {
  private readonly logger = new Logger(GuarantorController.name);

  constructor(
    private readonly guarantorService: GuarantorService,
    private readonly loanService: LoanService,
  ) {}

  // TODO: remove this route on production
  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @ApiOperation({
    description: 'Create a guarantor (this should not be used)',
  })
  @ApiCreatedResponse({
    type: Guarantor,
    description:
      'Create a debtor where the payment is included for an exisiting debtor',
  })
  @Post()
  async create(
    @Req() req: AuthReqType,
    @Body(new ZodPipe(CreateGuarantorScehma))
    createGuratantorDto: CreateGuarantorDto,
  ) {
    const guarator = await this.guarantorService.create(createGuratantorDto);
    return guarator;
  }

  // TODO: handle roll back for this function
  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @ApiCreatedResponse({
    type: Guarantor,
    description:
      'Create a debtor where the payment is included for an exisiting debtor',
  })
  @Post('/loan/:loanId')
  async createWithLoan(
    @Param('loanId') loanId: string,
    @Req() req: AuthReqType,
    @Body(new ZodPipe(CreateGuarantorScehma))
    createGuratantorDto: CreateGuarantorDto,
  ) {
    const guarator = await this.guarantorService.create(createGuratantorDto);
    await this.loanService.update(loanId, {
      guarantorId: guarator.id,
    });
    return guarator;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get()
  @ApiOkResponse({
    type: Guarantor,
    isArray: true,
    description: 'Find all guarantors by creditor Id',
  })
  async findAll(@Req() req: AuthReqType) {
    const guarantors = await this.guarantorService.findAll(req.user?.id);
    return guarantors;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Get(':id')
  @ApiOkResponse({
    type: Guarantor,
    description: 'Find guarantor with guarantor id as param',
  })
  async findOne(@Param('id') id: string, @Req() req: AuthReqType) {
    const creditorId = req.user?.id;
    const guarantor = await this.guarantorService.findOne(id);
    try {
      await this.loanService.authorizeGuarantorByCreditorId(id, creditorId);
    } catch (err) {
      if (guarantor) {
        throw new UnauthorizedException('You are not owner of this guarantor');
      }
      throw err;
    }
    return guarantor;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Patch(':id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Update guarantor with guarantor id as param',
  })
  async update(
    @Param('id') id: string,
    @Req() req: AuthReqType,
    @Body() updateGuarantorDto: UpdateGuarantorDto,
  ) {
    try {
      await this.loanService.authorizeGuarantorByCreditorId(id, req.user?.id);
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('You are not owner of this guarantor');
    }
    const status = await this.guarantorService.update(id, updateGuarantorDto);
    return status;
  }

  @UseGuards(MockAuthGuard)
  @ApiAuthorizationHeader()
  @Delete(':id')
  @ApiOkResponse({
    type: ResponseDto,
    description: 'Delete guarantor with guarantor id as param',
  })
  async remove(@Param('id') id: string, @Req() req: AuthReqType) {
    let loan: Loan;
    try {
      loan = await this.loanService.authorizeGuarantorByCreditorId(
        id,
        req.user?.id,
      );
    } catch (err) {
      this.logger.error(err);
      throw new UnauthorizedException('You are not owner of this guarantor');
    }
    const status = await this.guarantorService.remove(id);
    await this.loanService.update(loan.id, {
      guarantorId: FieldValue.delete(),
    });
    return status;
  }
}
