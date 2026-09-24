export const memberRoles = {
  none: {
    label:
      'No member role',
    data:
      {}
  },

  member: {
    label:
      'Normal Church Member',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true
    }
  },

  choir: {
    label:
      'Choir Member',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true,
      choir:
        true
    }
  },

  youth: {
    label:
      'Youth Member',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true,
      youth:
        true
    }
  },

  sundaySchool: {
    label:
      'Sunday School Member',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true,
      sundaySchool:
        true
    }
  },

  pastor: {
    label:
      'Pastor',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true,
      scripturePreparation:
        true
    }
  },

  languageSchool: {
    label:
      'Language School Member',
    data: {
      food:
        true,
      prayer:
        true,
      plan:
        true,
      languageSchool:
        true
    }
  }
}

export const adminRoles = {
  none: {
    label:
      'No admin role',
    data:
      {}
  },

  foodAdmin: {
    label:
      'Food Admin',
    data: {
      foodAdmin:
        true
    }
  },

  choirAdmin: {
    label:
      'Choir Admin',
    data: {
      choirAdmin:
        true
    }
  },

  choirPlanning: {
    label:
      'Choir Planning',
    data: {
      choirPlanning:
        true
    }
  },

  youthAdmin: {
    label:
      'Youth Admin',
    data: {
      youthAdmin:
        true
    }
  },

  prayerAdmin: {
    label:
      'Prayer Admin',
    data: {
      prayerAdmin:
        true
    }
  },

  sundaySchoolAdmin: {
    label:
      'Sunday School Admin',
    data: {
      sundaySchoolAdmin:
        true
    }
  },

  scripturePreparationAdmin: {
    label:
      'Scripture Preparation Admin',
    data: {
      scripturePreparationAdmin:
        true
    }
  },

  planAdmin: {
    label:
      'Service Plan Admin',
    data: {
      planAdmin:
        true
    }
  },

  churchAdmin: {
    label:
      'Church Admin',
    data: {
      churchAdmin:
        true
    }
  },

  languageSchoolAdmin: {
    label:
      'Language School Admin',
    data: {
      languageSchoolAdmin:
        true
    }
  },

  chiefAdministrator: {
    label:
      'Chief Administrator',
    data: {
      foodAdmin:
        true,
      choirAdmin:
        true,
      choirPlanning:
        true,
      youthAdmin:
        true,
      prayerAdmin:
        true,
      sundaySchoolAdmin:
        true,
      scripturePreparationAdmin:
        true,
      planAdmin:
        true,
      dailyDevotionAdmin:
        true,
      aiBibleReadingAdmin:
        true,
      languageSchoolAdmin:
        true,
      churchAdmin:
        true,
      chiefAdministrator:
        true
    }
  }
}
