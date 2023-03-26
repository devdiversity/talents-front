import { ISearchData, ISearchValues, ISelectedDate, ITableSchema } from './types';
import { date } from 'quasar';

type SearchData = { [key: string]: unknown }[];

export default class SearchOnTable {
  data!: SearchData;
  schema!: ITableSchema;
  searchItems!: ISearchValues;

  constructor(data: SearchData, schema: ITableSchema) {
    this.data = data;
    this.schema = schema;
    if (!this.searchItems) this.searchItems = <ISearchValues>{};
    if (this.schema) {
      this.schema.columns.map((c) => {
        if (c.search && c.field) {
          this.searchItems[c.field] = {
            component: c.search.component,
            value: '',
            mode: '', // c.search.componentConfig?.mode as string
          };
        }
      });
    }
  }

  searchAndClearOther(name: string) {
    const searchElements = document.querySelectorAll('[th-search]');
    searchElements.forEach((e) => {
      const n = e.attributes.getNamedItem('th-search')?.value || '';
      if (n !== name) {
        (e as HTMLInputElement).value = '';
        this.searchItems[n].value = '';
      }
    });
    for (const si in this.searchItems) {
      if (this.searchItems[si].mode === 'text' && si !== name) {
        this.searchItems[si].value = '';
      }
    }
  }

  setData(data: SearchData) {
    this.data = { ...data };
  }

  hasSearchData(): boolean {
    for (const si in this.searchItems) {
      if (this.searchItems[si].value !== '') return true;
    }
    return false;
  }

  hasSearchText(): boolean {
    for (const si in this.searchItems) {
      if (this.searchItems[si].mode === 'text' && this.searchItems[si].value !== '') return true;
    }
    return false;
  }

  textSearch(filtredData: SearchData, searchField: string): SearchData {
    switch (this.schema.searchTextStrategy) {
      case 'single':
        const tmp: SearchData = [];
        for (const si in this.searchItems) {
          if (searchField === si && this.searchItems[si].mode === 'text') {
            this.searchAndClearOther(searchField);
            let value = this.searchItems[si].value as string;
            for (const o of filtredData) {
              if (value !== '') {
                let text = o[si] as string;
                text = text.replace(new RegExp('<b>', 'g'), '');
                text = text.replace(new RegExp('</b>', 'g'), '');
                const pos = text.toLowerCase().indexOf(value.toLowerCase());
                if (pos !== -1) {
                  value = text.substr(pos, value.length);
                  o[si] = text.replace(new RegExp(value, 'g'), `<b>${value}</b>`);
                  tmp.push(o);
                }
              }
            }
          }
        }
        return tmp;
      case 'or':
        const tmpOr: { [key: string]: { [key: string]: unknown } } = {};
        for (const si in this.searchItems) {
          if (this.searchItems[si].mode === 'text') {
            let value = this.searchItems[si].value as string;
            for (const o of filtredData) {
              if (value !== '') {
                let text = o[si] as string;
                text = text.replace(new RegExp('<b>', 'g'), '');
                text = text.replace(new RegExp('</b>', 'g'), '');
                const pos = text.toLowerCase().indexOf(value.toLowerCase());
                if (pos !== -1) {
                  value = text.substr(pos, value.length);
                  const id = o.id as string;
                  if (!tmpOr[id]) tmpOr[id] = o;
                  tmpOr[id][si] = text.replace(new RegExp(value, 'g'), `<b>${value}</b>`);
                }
              }
            }
          }
        }
        return Object.values(tmpOr);
      case 'and':
        const search = (data: SearchData, field: string, value: string): SearchData => {
          const tmp: SearchData = [];
          for (const o of data) {
            if (value !== '') {
              const text = o[field] as string;
              const pos = text.toLowerCase().indexOf(value.toLowerCase());
              if (pos !== -1) {
                value = text.substr(pos, value.length);
                o[field] = text.replace(new RegExp(value, 'g'), `<b>${value}</b>`);
                tmp.push(o);
              }
            } else {
              return data;
            }
          }
          return tmp;
        };
        for (const si in this.searchItems) {
          if (this.searchItems[si].mode === 'text') {
            filtredData = search(filtredData, si, this.searchItems[si].value as string);
          }
        }
        return filtredData;
    }
    return [];
  }

  tableSearch(data: ISearchData): SearchData {
    let filtredData: SearchData = Object.assign([], JSON.parse(JSON.stringify(this.data)));

    this.searchItems[data.field].value = data.value;
    this.searchItems[data.field].mode = data.type;

    if (!this.hasSearchData()) return filtredData;

    for (const si in this.searchItems) {
      if (this.searchItems[si].mode === 'array' && this.searchItems[si].value !== '') {
        filtredData = filtredData.filter((d) => {
          if (typeof d[si] === 'string') return d[si] === this.searchItems[si].value;
          if ((d[si] as unknown[]).length > 0) return (d[si] as unknown[]).indexOf(this.searchItems[si].value as string) !== -1;
          return true;
        });
      }
      if (this.searchItems[si].mode === 'selective' && this.searchItems[si].value !== '') {
        filtredData = filtredData.filter((d) => {
          return d[si] === this.searchItems[si].value;
        });
      }
      if (this.searchItems[si].mode === 'date' && this.searchItems[si].value !== '') {
        if (typeof this.searchItems[si].value === 'string') {
          const val = this.searchItems[si].value;
          filtredData = filtredData.filter((d) => {
            return date.formatDate(d[si] as Date, 'DD-MM-YYYY') === val;
          });
        } else {
          const val = this.searchItems[si].value as ISelectedDate;
          const from = date.subtractFromDate(date.extractDate(val.from, 'DD-MM-YYYY'), { days: 1 });
          const to = date.addToDate(date.extractDate(val.to, 'DD-MM-YYYY'), {
            days: 1,
          });

          filtredData = filtredData.filter((d) => {
            return date.isBetweenDates(d[si] as Date, from, to);
          });
        }
      }
    }

    if (this.hasSearchText()) filtredData = this.textSearch(filtredData, data.field);

    return filtredData;
  }
}
