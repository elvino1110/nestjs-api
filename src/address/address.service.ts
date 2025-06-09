import { Inject, Injectable } from "@nestjs/common";
import { User } from "generated/prisma";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "../common/prisma.service";
import { ValidationService } from "../common/validation.service";
import { AddressResponse, CreateAddressRequest } from "../model/address.model";
import { add, Logger } from "winston"
import { AddressValidation } from "./address.validation";
import { contactService } from "../contact/contact.service";
@Injectable()
export class AddressService {
    constructor(
        @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
        private prismaService: PrismaService,
        private validationService: ValidationService,
        private contactService: contactService
    ) {}

    async create(
        user: User,
        request: CreateAddressRequest
    ): Promise<AddressResponse> {

        this.logger.info(`AddressService.create(${JSON.stringify(user)}, ${JSON.stringify(request)})`)

        const createRequest: CreateAddressRequest = this.validationService.validate(AddressValidation.CREATE, request)

        //cek contactID
        await this.contactService.checkContactMustExists(user.username, createRequest.contact_id)

        //insert data
        const address = await this.prismaService.address.create({
            data: createRequest
        })

        return {
            id: address.id,
            street: address.street ?? undefined,
            city: address.city ?? undefined,
            province: address.province ?? undefined,
            country: address.country ?? undefined,
            postal_code: address.postal_code
        }

    }
}