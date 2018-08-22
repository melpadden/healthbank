import { by, ElementFinder } from 'protractor';

export class ListingPO {
  injectLoadMore(composer: any, content: ElementFinder) {
    composer.loadMoreBtn = content.element(by.tagName('load-more')).element(by.className('btn-default'));
  }

  /**
   * unfolds the result list. Simple spoken: click on load more until it disappears.
   * @param loadMoreBtn
   */
  unfoldResults(loadMoreBtn: ElementFinder) {
    return loadMoreBtn.isPresent().then((present) => {
      // console.log('unfold results', present);
      if (present) {
        return loadMoreBtn.click().then(() => {this.unfoldResults(loadMoreBtn); });
      }
    });
  }

  /**
   * if not visible, shows the search, filter and sort forms
   */
  displaySearch(listPage: ElementFinder) {
    // console.log('displaySearch!');
    return listPage.$('form.search-sidebar').isDisplayed().then((displayed) => {
      // console.log('search sidebar:', displayed);
      if (!displayed) {
        return listPage.element(by.id('toggle-search-form')).click();
      }
    });
  }
}
