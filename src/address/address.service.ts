import { HttpException, Inject, Injectable } from "@nestjs/common";
import { Address, User } from "generated/prisma";
import { WINSTON_MODULE_PROVIDER } from "nest-winston";
import { PrismaService } from "../common/prisma.service";
import { ValidationService } from "../common/validation.service";
import { AddressResponse, CreateAddressRequest, GetAddressRequest, RemoveAddressRequest, UpdateAddressRequest } from "../model/address.model";
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

        return this.toAddressResponse(address)

    }

    toAddressResponse(address: Address): AddressResponse {
        return {
            id: address.id,
            street: address.street ?? undefined,
            city: address.city ?? undefined,
            province: address.province ?? undefined,
            country: address.country ?? undefined,
            postal_code: address.postal_code
        }
    }

    async checkAddressMustExist(contactId: number, addresId: number): Promise<Address> {
        const address = await this.prismaService.address.findFirst({
            where: {
                id: addresId,
                contact_id: contactId
            }
        })

        if (!address) {
            throw new HttpException("Address is not found", 404)
        }
        return address
    }

    async get(user: User, request: GetAddressRequest): Promise<AddressResponse> {
    
        const getRequest: GetAddressRequest = this.validationService.validate(AddressValidation.GET, request)

        //cek contactID
        await this.contactService.checkContactMustExists(user.username, getRequest.contact_id)

        //cek address
        const address = await this.checkAddressMustExist(getRequest.contact_id, getRequest.address_id)

        return this.toAddressResponse(address)

    }

    async update(user: User, request: UpdateAddressRequest): Promise<AddressResponse> {
        const updateRequest: UpdateAddressRequest = this.validationService.validate(AddressValidation.UPDATE, request)

        //cek contactID
        await this.contactService.checkContactMustExists(user.username, updateRequest.contact_id)

        //cek address
        let address = await this.checkAddressMustExist(updateRequest.contact_id, updateRequest.id)
        
        //update data
        address = await this.prismaService.address.update({
            where: {
                id: address.id,
                contact_id: address.contact_id
            },
            data: updateRequest
        })

        return this.toAddressResponse(address)

    }

    async remove(user: User, request: RemoveAddressRequest): Promise<AddressResponse> {

        const removeAddressRequest: RemoveAddressRequest = this.validationService.validate(AddressValidation.REMOVE, request)

        await this.contactService.checkContactMustExists(user.username, removeAddressRequest.contact_id)

        await this.checkAddressMustExist(removeAddressRequest.contact_id, removeAddressRequest.address_id)

        const address = await this.prismaService.address.delete({
            where: {
                id: removeAddressRequest.address_id,
                contact_id: removeAddressRequest.contact_id
            }
        })
        return this.toAddressResponse(address)
    }

    async list(user: User, contacId: number): Promise<AddressResponse[]> {
        await this.contactService.checkContactMustExists(user.username, contacId)
        const address = await this.prismaService.address.findMany({
            where: {
                contact_id: contacId
            }
        })

        return address.map(address => this.toAddressResponse(address))
    }
}