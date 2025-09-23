import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ConstantsService } from './constants.service';

@Controller('constants')
export class ConstantsController {
  constructor(private readonly constantsService: ConstantsService) {}

  // Support Contacts endpoints
  @Get('support-contacts')
  async getSupportContacts(@Query('department') department?: string) {
    return this.constantsService.getSupportContacts(department);
  }

  @Get('support-contacts/primary')
  async getPrimarySupportContact() {
    return this.constantsService.getPrimarySupportContact();
  }

  @Get('support-contacts/:id')
  async getSupportContactById(@Param('id') id: string) {
    return this.constantsService.getSupportContactById(id);
  }

  // Business Configuration endpoints
  @Get('business-config')
  async getBusinessConfig(@Query('category') category?: string) {
    return this.constantsService.getBusinessConfig(category);
  }

  @Get('business-config/:category/:key')
  async getConfigValue(
    @Param('category') category: string,
    @Param('key') key: string
  ) {
    return this.constantsService.getConfigValue(category, key);
  }

  @Get('business-config/category/:category')
  async getConfigByCategory(@Param('category') category: string) {
    return this.constantsService.getConfigByCategory(category);
  }

  // Pickup Points endpoints
  @Get('pickup-points')
  async getPickupPoints() {
    return this.constantsService.getPickupPoints();
  }


  @Get('pickup-points/:id')
  async getPickupPointById(@Param('id') id: string) {
    return this.constantsService.getPickupPointById(id);
  }

  // Validation Rules endpoints
  @Get('validation-rules')
  async getValidationRules(@Query('fieldType') fieldType?: string) {
    return this.constantsService.getValidationRules(fieldType);
  }

  @Get('validation-rules/:fieldType/:ruleName')
  async getValidationRuleByField(
    @Param('fieldType') fieldType: string,
    @Param('ruleName') ruleName: string
  ) {
    return this.constantsService.getValidationRuleByField(fieldType, ruleName);
  }

  // Margins endpoints
  @Get('margins')
  async getMargins() {
    return this.constantsService.getMargins();
  }

  @Get('margins/:class')
  async getMarginByClass(@Param('class') classParam: string) {
    return this.constantsService.getMarginByClass(classParam);
  }

  // System Messages endpoints
  @Get('system-messages')
  async getSystemMessages(
    @Query('messageType') messageType?: string,
    @Query('language') language: string = 'en'
  ) {
    return this.constantsService.getSystemMessages(messageType, language);
  }

  @Get('system-messages/:messageType/:messageKey')
  async getSystemMessage(
    @Param('messageType') messageType: string,
    @Param('messageKey') messageKey: string,
    @Query('language') language: string = 'en'
  ) {
    return this.constantsService.getSystemMessage(messageType, messageKey, language);
  }

  // Admin endpoints for updating constants
  @Put('support-contacts/:id')
  async updateSupportContact(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.constantsService.updateSupportContact(id, data);
  }

  @Put('business-config/:id/int')
  async updateBusinessConfigInt(
    @Param('id') id: string,
    @Body() body: { value: number }
  ) {
    return this.constantsService.updateBusinessConfigInt(id, body.value);
  }

  @Put('business-config/:id/float')
  async updateBusinessConfigFloat(
    @Param('id') id: string,
    @Body() body: { value: number }
  ) {
    return this.constantsService.updateBusinessConfigFloat(id, body.value);
  }

  @Put('business-config/:id/string')
  async updateBusinessConfigString(
    @Param('id') id: string,
    @Body() body: { value: string }
  ) {
    return this.constantsService.updateBusinessConfigString(id, body.value);
  }

  @Put('business-config/:id/bool')
  async updateBusinessConfigBool(
    @Param('id') id: string,
    @Body() body: { value: boolean }
  ) {
    return this.constantsService.updateBusinessConfigBool(id, body.value);
  }

  @Put('business-config/:id')
  async updateBusinessConfig(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.constantsService.updateBusinessConfig(id, data);
  }

  @Put('pickup-points/:id')
  async updatePickupPoint(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.constantsService.updatePickupPoint(id, data);
  }

  @Put('validation-rules/:id')
  async updateValidationRule(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.constantsService.updateValidationRule(id, data);
  }

  @Put('system-messages/:id')
  async updateSystemMessage(
    @Param('id') id: string,
    @Body() data: any
  ) {
    return this.constantsService.updateSystemMessage(id, data);
  }
}
