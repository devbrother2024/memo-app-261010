import { expect, test } from '@playwright/test'

const SUMMARY_TEXT = '프로젝트 킥오프 준비사항을 요약한 문장입니다.'

test.describe('메모 요약', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByText('총 ').first().waitFor()
    await page.getByTestId('memo-card').first().click()
    await expect(page.getByTestId('memo-viewer')).toBeVisible()
  })

  test('요약 버튼을 누르면 요약 결과가 표시된다', async ({ page }) => {
    await page.route('**/api/summarize', route =>
      route.fulfill({ json: { summary: SUMMARY_TEXT } })
    )

    await page.getByTestId('memo-viewer-summarize-btn').click()

    await expect(page.getByTestId('memo-viewer-summary')).toContainText(
      SUMMARY_TEXT
    )
  })

  test('서버 에러 시 에러 메시지가 표시된다', async ({ page }) => {
    await page.route('**/api/summarize', route =>
      route.fulfill({
        status: 502,
        json: { error: '요약 중 오류가 발생했습니다.' },
      })
    )

    await page.getByTestId('memo-viewer-summarize-btn').click()

    await expect(page.getByTestId('memo-viewer-summary-error')).toContainText(
      '요약 중 오류가 발생했습니다.'
    )
    await expect(page.getByTestId('memo-viewer-summary')).toHaveCount(0)
  })

  test('요약 중에는 버튼이 비활성화된다', async ({ page }) => {
    await page.route('**/api/summarize', async route => {
      await new Promise(resolve => setTimeout(resolve, 500))
      await route.fulfill({ json: { summary: SUMMARY_TEXT } })
    })

    const button = page.getByTestId('memo-viewer-summarize-btn')
    await button.click()

    await expect(button).toBeDisabled()
    await expect(page.getByTestId('memo-viewer-summary-loading')).toBeVisible()
    await expect(page.getByTestId('memo-viewer-summary')).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('상세보기를 닫았다 열면 이전 요약이 사라진다', async ({ page }) => {
    await page.route('**/api/summarize', route =>
      route.fulfill({ json: { summary: SUMMARY_TEXT } })
    )

    await page.getByTestId('memo-viewer-summarize-btn').click()
    await expect(page.getByTestId('memo-viewer-summary')).toBeVisible()

    await page.getByTestId('memo-viewer-close-btn').click()
    await page.getByTestId('memo-card').first().click()

    await expect(page.getByTestId('memo-viewer')).toBeVisible()
    await expect(page.getByTestId('memo-viewer-summary')).toHaveCount(0)
  })
})
