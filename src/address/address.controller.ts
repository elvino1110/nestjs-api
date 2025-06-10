import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { AddressService } from "./address.service";
import { WebResponse } from "../model/web.model";
import { AddressResponse, CreateAddressRequest, GetAddressRequest, RemoveAddressRequest, UpdateAddressRequest } from "../model/address.model";
import { Auth } from "../common/auth.decorator";
import { User } from "generated/prisma";

@Controller('/api/contacts/:contactId/addresses')
export class AddressController {
    constructor(private addressService: AddressService) {}

    @Post()
    @HttpCode(200)
    async create(
        @Auth() user: User,
        @Param('contactId', ParseIntPipe) contacId: number,
        @Body() request: CreateAddressRequest
    ): Promise<WebResponse<AddressResponse>> {
        request.contact_id = contacId
        const result = await this.addressService.create(user, request)

        return {
            data: result
        }
    }

    @Get('/:addressId')
    @HttpCode(200)
    async get(
        @Auth() user: User,
        @Param('contactId', ParseIntPipe) contacId: number,
        @Param('addressId', ParseIntPipe) addressId: number,
    ): Promise<WebResponse<AddressResponse>> {
        const request: GetAddressRequest = {
            contact_id: contacId,
            address_id: addressId
        }
        const result = await this.addressService.get(user, request)

        return {
            data: result
        }
    }

    @Put(':addressId')
    @HttpCode(200)
    async update(
        @Auth() user: User,
        @Param('contactId', ParseIntPipe) contacId: number,
        @Param('addressId', ParseIntPipe) addressId: number,
        @Body() request: UpdateAddressRequest
    ): Promise<WebResponse<AddressResponse>> {
        request.contact_id = contacId
        request.id = addressId
        const result = await this.addressService.update(user, request)

        return {
            data: result
        }
    }

    @Delete('/:addressId')
    @HttpCode(200)
    async remove(
        @Auth() user: User,
        @Param('contactId', ParseIntPipe) contacId: number,
        @Param('addressId', ParseIntPipe) addressId: number,
    ): Promise<WebResponse<boolean>> {
        const request: RemoveAddressRequest = {
            contact_id: contacId,
            address_id: addressId
        }
        const result = await this.addressService.remove(user, request)

        return {
            data: true
        }
    }

    @Get()
    @HttpCode(200)
    async list(
        @Auth() user: User,
        @Param('contactId', ParseIntPipe) contacId: number,
    ): Promise<WebResponse<AddressResponse[]>> {
        
        const result = await this.addressService.list(user, contacId)

        return {
            data: result
        }
    }

}