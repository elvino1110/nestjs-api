import { Module } from "@nestjs/common";
import { contactService } from "./contact.service";
import { ContactController } from "./contact.controller";

@Module({
    providers: [contactService],
    controllers: [ContactController],
    exports: [contactService]
})
export class ContactModule {}