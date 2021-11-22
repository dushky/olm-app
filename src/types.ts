import CIcon from '@coreui/icons-react'

export interface SidebarNavItemBadge {
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | string
  text: string
}

export interface SidebarNavItem {
  component: React.ForwardRefExoticComponent<any>
  name: string
  permission?: string
  to?: string
  icon?: CIcon
  badge?: SidebarNavItemBadge
  items?: SidebarNavItem[]
}

export interface TableColumn {
  column: string
  name: string
  style?: object
}

export interface TableAction {
  handleClick: (id: string) => void
  color:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | string
  text?: string
  textColor?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'danger'
    | 'warning'
    | 'info'
    | 'dark'
    | 'light'
    | string
  icon?: CIcon
  permission?: string
}

export interface Event {
  id: number
  title: string
  start: Date
  end: Date
}

export interface Reservation {
  id: number
  title: string
  start: Date
  end: Date
}