/**
 * TemplateService - テンプレートのCRUD操作と並び替えを提供
 * 
 * このサービスは、テンプレートの作成・読取・更新・削除と、
 * 並び順の管理を担当します。
 */

import { ok, err } from '../types';
import type {
  Template,
  TemplateCreateInput,
  TemplateError,
  Result,
} from '../types';
import { STORAGE_KEYS, MIN_AMOUNT } from '../types/constants';
import { StorageAdapter } from './StorageAdapter';

/**
 * テンプレート管理サービス
 */
export class TemplateService {
  private storageAdapter: StorageAdapter;

  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
  }

  /**
   * テンプレートを作成する
   * 
   * @param input テンプレート作成入力
   * @returns 作成されたテンプレートまたはエラー
   */
  create(input: TemplateCreateInput): Result<Template, TemplateError> {
    // バリデーション
    const validationError = this.validateCreateInput(input);
    if (validationError) {
      return err(validationError);
    }

    // 既存のテンプレートを取得
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    if (!templatesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get templates: ${templatesResult.error.message}`,
      });
    }

    const templates = templatesResult.value || [];

    // 並び順を決定（既存の最大値+1、または0）
    const maxSortOrder = templates.length > 0
      ? Math.max(...templates.map((t) => t.sort_order))
      : -1;
    const newSortOrder = maxSortOrder + 1;

    // 新しいテンプレートを作成
    const now = new Date().toISOString();
    const newTemplate: Template = {
      id: crypto.randomUUID(),
      name: input.name,
      category: input.category,
      subcategory: input.subcategory,
      amount: input.amount ?? null,
      memo_template: input.memo_template ?? null,
      sort_order: newSortOrder,
      created_at: now,
      updated_at: now,
    };

    // 保存
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.TEMPLATES, [...templates, newTemplate]);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save template: ${saveResult.error.message}`,
      });
    }

    return ok(newTemplate);
  }

  /**
   * テンプレートを更新する
   * 
   * @param id テンプレートID
   * @param input 更新データ
   * @returns 更新されたテンプレートまたはエラー
   */
  update(id: string, input: Partial<TemplateCreateInput>): Result<Template, TemplateError> {
    // 既存のテンプレートを取得
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    if (!templatesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get templates: ${templatesResult.error.message}`,
      });
    }

    const templates = templatesResult.value || [];
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) {
      return err({
        type: 'NOT_FOUND',
        id,
      });
    }

    // 更新データのバリデーション
    const updatedTemplate = { ...templates[index], ...input };
    const validationError = this.validateTemplate(updatedTemplate);
    if (validationError) {
      return err(validationError);
    }

    // 更新日時を更新
    updatedTemplate.updated_at = new Date().toISOString();

    // 保存
    templates[index] = updatedTemplate;
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.TEMPLATES, templates);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to save template: ${saveResult.error.message}`,
      });
    }

    return ok(updatedTemplate);
  }

  /**
   * テンプレートを削除する
   * 
   * @param id テンプレートID
   * @returns 成功またはエラー
   */
  delete(id: string): Result<void, TemplateError> {
    // 既存のテンプレートを取得
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    if (!templatesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get templates: ${templatesResult.error.message}`,
      });
    }

    const templates = templatesResult.value || [];
    const index = templates.findIndex((t) => t.id === id);

    if (index === -1) {
      return err({
        type: 'NOT_FOUND',
        id,
      });
    }

    // 削除
    templates.splice(index, 1);
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.TEMPLATES, templates);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to delete template: ${saveResult.error.message}`,
      });
    }

    return ok(undefined);
  }

  /**
   * テンプレート一覧を取得する（並び順順）
   * 
   * @returns テンプレート配列
   */
  list(): Template[] {
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    if (!templatesResult.ok || !templatesResult.value) {
      return [];
    }

    const templates = templatesResult.value;
    // 並び順でソート
    return [...templates].sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * テンプレートの並び順を変更する
   * 
   * @param orderedIds 並び替え後のID配列（順序通り）
   * @returns 成功またはエラー
   */
  reorder(orderedIds: string[]): Result<void, TemplateError> {
    // 既存のテンプレートを取得
    const templatesResult = this.storageAdapter.get<Template[]>(STORAGE_KEYS.TEMPLATES);
    if (!templatesResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to get templates: ${templatesResult.error.message}`,
      });
    }

    const templates = templatesResult.value || [];

    // IDの存在確認
    const templateMap = new Map(templates.map((t) => [t.id, t]));
    for (const id of orderedIds) {
      if (!templateMap.has(id)) {
        return err({
          type: 'NOT_FOUND',
          id,
        });
      }
    }

    // すべてのテンプレートが含まれているか確認
    if (orderedIds.length !== templates.length) {
      return err({
        type: 'VALIDATION_ERROR',
        field: 'orderedIds',
        message: 'すべてのテンプレートIDを含める必要があります',
      });
    }

    // 並び順を更新
    const reorderedTemplates = orderedIds.map((id, index) => {
      const template = templateMap.get(id)!;
      return {
        ...template,
        sort_order: index,
        updated_at: new Date().toISOString(),
      };
    });

    // 保存
    const saveResult = this.storageAdapter.set(STORAGE_KEYS.TEMPLATES, reorderedTemplates);
    if (!saveResult.ok) {
      return err({
        type: 'STORAGE_ERROR',
        message: `Failed to reorder templates: ${saveResult.error.message}`,
      });
    }

    return ok(undefined);
  }

  /**
   * 作成入力のバリデーション
   */
  private validateCreateInput(input: TemplateCreateInput): TemplateError | null {
    // 表示名のバリデーション
    if (!input.name || input.name.trim().length === 0) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'name',
        message: '表示名は必須です',
      };
    }

    // 金額のバリデーション（設定されている場合）
    if (input.amount !== undefined && input.amount !== null && input.amount < MIN_AMOUNT) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'amount',
        message: `金額は${MIN_AMOUNT}以上である必要があります`,
      };
    }

    return null;
  }

  /**
   * テンプレートエンティティのバリデーション
   */
  private validateTemplate(template: Partial<Template>): TemplateError | null {
    // 表示名のバリデーション
    if (template.name !== undefined && (!template.name || template.name.trim().length === 0)) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'name',
        message: '表示名は必須です',
      };
    }

    // 金額のバリデーション（設定されている場合）
    if (template.amount !== undefined && template.amount !== null && template.amount < MIN_AMOUNT) {
      return {
        type: 'VALIDATION_ERROR',
        field: 'amount',
        message: `金額は${MIN_AMOUNT}以上である必要があります`,
      };
    }

    return null;
  }
}
